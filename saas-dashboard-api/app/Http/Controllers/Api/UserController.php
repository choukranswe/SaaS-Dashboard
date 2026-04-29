<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = User::where('tenant_id', $request->user()->tenant_id)
            ->latest()
            ->get();

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_MANAGER, User::ROLE_VIEWER])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $user,
        ], 201);
    }

    /**
     * Import users from a CSV file into the authenticated admin's tenant.
     */
    public function importCsv(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $handle = fopen($validated['file']->getRealPath(), 'r');

        if (! $handle) {
            return response()->json([
                'message' => 'Unable to read the uploaded CSV file.',
            ], 422);
        }

        $header = fgetcsv($handle);

        if (! $header) {
            fclose($handle);

            return response()->json([
                'message' => 'CSV import failed.',
                'errors' => [
                    [
                        'row' => 1,
                        'email' => null,
                        'errors' => ['The CSV file is empty or missing a header row.'],
                    ],
                ],
            ], 422);
        }

        $columns = array_map(fn ($column) => strtolower(trim($column)), $header);
        $missingColumns = array_diff(['name', 'email', 'role'], $columns);

        if (! empty($missingColumns)) {
            fclose($handle);

            return response()->json([
                'message' => 'CSV import failed.',
                'errors' => [
                    [
                        'row' => 1,
                        'email' => null,
                        'errors' => ['Missing required columns: '.implode(', ', $missingColumns).'.'],
                    ],
                ],
            ], 422);
        }

        $tenantId = $request->user()->tenant_id;
        $importedCount = 0;
        $errors = [];
        $seenEmails = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            if ($this->csvRowIsEmpty($row)) {
                continue;
            }

            $values = array_slice(array_pad($row, count($columns), ''), 0, count($columns));
            $rowData = array_combine($columns, $values);
            $password = trim($rowData['password'] ?? '');

            $payload = [
                'name' => trim($rowData['name'] ?? ''),
                'email' => trim($rowData['email'] ?? ''),
                'role' => strtolower(trim($rowData['role'] ?? '')),
                'password' => $password !== '' ? $password : 'password',
            ];

            $validator = Validator::make($payload, [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_MANAGER, User::ROLE_VIEWER])],
                'password' => ['required', 'string', 'min:8'],
            ]);

            $rowErrors = $validator->errors()->all();
            $normalizedEmail = strtolower($payload['email']);

            if ($normalizedEmail !== '' && in_array($normalizedEmail, $seenEmails, true)) {
                $rowErrors[] = 'Duplicate email in this CSV file.';
            }

            if (! empty($rowErrors)) {
                $errors[] = [
                    'row' => $rowNumber,
                    'email' => $payload['email'] ?: null,
                    'errors' => $rowErrors,
                ];

                continue;
            }

            User::create([
                'tenant_id' => $tenantId,
                'name' => $payload['name'],
                'email' => $payload['email'],
                'role' => $payload['role'],
                'password' => Hash::make($payload['password']),
            ]);

            $seenEmails[] = $normalizedEmail;
            $importedCount++;
        }

        fclose($handle);

        return response()->json([
            'message' => 'CSV import completed',
            'imported_count' => $importedCount,
            'failed_count' => count($errors),
            'errors' => $errors,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = User::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $tenantUser = User::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($tenantUser->id)],
            'role' => ['sometimes', Rule::in([User::ROLE_ADMIN, User::ROLE_MANAGER, User::ROLE_VIEWER])],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        if (! empty($validated['password'])) {
            $tenantUser->password = Hash::make($validated['password']);
        }

        unset($validated['password']);
        unset($validated['password_confirmation']);

        $tenantUser->fill($validated);
        $tenantUser->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $tenantUser,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $tenantUser = User::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        if ($tenantUser->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $tenantUser->tokens()->delete();
        $tenantUser->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    private function csvRowIsEmpty(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }
}

<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('role:admin,manager,viewer');

    Route::get('/users', [UserController::class, 'index'])->middleware('role:admin,manager');
    Route::post('/users', [UserController::class, 'store'])->middleware('role:admin');
    Route::post('/users/import-csv', [UserController::class, 'importCsv'])->middleware('role:admin');
    Route::get('/users/{id}', [UserController::class, 'show'])->middleware('role:admin,manager');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('role:admin');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('role:admin');

    Route::get('/projects', [ProjectController::class, 'index'])->middleware('role:admin,manager,viewer');
    Route::post('/projects', [ProjectController::class, 'store'])->middleware('role:admin,manager');
    Route::get('/projects/{id}', [ProjectController::class, 'show'])->middleware('role:admin,manager,viewer');
    Route::put('/projects/{id}', [ProjectController::class, 'update'])->middleware('role:admin,manager');
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy'])->middleware('role:admin');

    Route::get('/tasks', [TaskController::class, 'index'])->middleware('role:admin,manager,viewer');
    Route::post('/tasks', [TaskController::class, 'store'])->middleware('role:admin,manager');
    Route::get('/tasks/{id}', [TaskController::class, 'show'])->middleware('role:admin,manager,viewer');
    Route::put('/tasks/{id}', [TaskController::class, 'update'])->middleware('role:admin,manager');
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->middleware('role:admin');
});

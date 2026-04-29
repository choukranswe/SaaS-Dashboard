export const parseApiError = (error, fallbackMessage = 'Something went wrong.') => {
  const response = error?.response?.data

  return {
    message: response?.message || fallbackMessage,
    errors: response?.errors || {},
  }
}

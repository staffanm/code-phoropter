<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class AuthenticationService
{
    private UserRepository $userRepo;
    private int $maxAttempts = 5;
    private int $lockoutMinutes = 15;

    public function __construct(UserRepository $userRepo)
    {
        $this->userRepo = $userRepo;
    }

    /**
     * Authenticate user with email and password
     * @throws ValidationException
     */
    public function authenticate(string $email, string $password): array
    {
        $cacheKey = "login_attempts:{$email}";

        // Check if account is locked__GHOST_CARET__
        __GHOST_BEGIN__$attempts = Cache::get($cacheKey, 0);
        if ($attempts >= $this->maxAttempts) {
            throw ValidationException::withMessages([
                'email' => ['Account locked due to too many failed attempts.']
            ]);
        }__GHOST_END__

        $user = $this->userRepo->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            // Increment failed attempts
            Cache::put($cacheKey, $attempts + 1, now()->addMinutes($this->lockoutMinutes));

            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.']
            ]);
        }

        // Clear login attempts on successful authentication
        Cache::forget($cacheKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'expires_at' => now()->addDays(30)->toDateTimeString()
        ];
    }

    public function resetPassword(User $user, string $newPassword): bool
    {
        $user->password = Hash::make($newPassword);
        return $user->save();
    }
}
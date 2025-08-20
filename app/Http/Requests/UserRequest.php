<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'userName' => 'required|unique:users|max:255',
            'fullName' => 'required|max:255',
            'email' => 'required|email|unique:users|max:255',
            'password' => 'required|min:8',
            'joiningDate' => 'required|date',
        ];
    }

    public function messages()
    {
        return [
            'userName.required' => 'The username field is required.',
            'userName.unique' => 'The username already exists.',
            'userName.max' => 'The username must not exceed 255 characters.',
            'fullName.required' => 'The name field is required.',
            'fullName.max' => 'The name must not exceed 255 characters.',
            'email.required' => 'The email field is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'The email address is already registered.',
            'email.max' => 'The email address must not exceed 255 characters.',
            'password.required' => 'The password field is required.',
            'password.min' => 'The password must be at least 8 characters long.',
            'joiningDate.required' => 'The joining date field is required.',
            'joiningDate.date' => 'Please provide a valid date for the joining date.',
        ];
    }
}

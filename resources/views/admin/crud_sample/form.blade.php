<div class="row mb-3">
    <div class="col">
        <label class="form-label" for="title">Title</label>
        {{ Form::text('title', old('title'), ['class' => 'form-control', 'required']) }}
        @if ($errors->has('title'))
            <label id="title-error" class="error" for="title">{{ $errors->first('title') }}</label>
        @endif
    </div>
</div>

<div class="row mb-3">
    <div class="col">
        <label class="form-label" for="username">Username</label>
        {{ Form::text('username', old('username'), ['class' => 'form-control', 'required']) }}
        @if ($errors->has('username'))
            <label id="username-error" class="error" for="username">{{ $errors->first('username') }}</label>
        @endif
    </div>
</div>

<div class="row mb-3">
    <div class="col">
        <label class="form-label" for="password">Password</label>
        {{ Form::text('password', old('password'), ['class' => 'form-control', 'required']) }}
        @if ($errors->has('password'))
            <label id="password-error" class="error" for="password">{{ $errors->first('password') }}</label>
        @endif
    </div>
</div>
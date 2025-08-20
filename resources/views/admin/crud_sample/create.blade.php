@extends('admin.layout.master')
@section('page-header', 'Add Account')
@section('content')
    <div class="row" style="height: 100%">
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    {!! Form::open([
                        'url' => route('account.store'),
                        'autocomplete' => 'off',
                        'id' => 'formAccount',                        
                    ]) !!}

                    @include('admin.account.form')

                    <div class="row">
                        <div class="col">
                            <button class="btn btn-primary" id="saveAccount">Save Account</button>
                        </div>
                    </div>

                    {!! Form::close() !!}
                </div>
            </div>
        </div>
    </div>
@endsection

@section('script')
    <script>
        $('#formAccount').validate();
    </script>
@endsection

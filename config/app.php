<?php

use Illuminate\Support\Facades\Facade;

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application. This value is used when the
    | framework needs to place the application's name in a notification or
    | any other location as required by the application or its packages.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    'LOGIN_ENC_KEY' => env('LOGIN_ENC_KEY', 'I6PnEPbQNLslYMj7ChKxDJ2yenuHLkXn'),
    'DEFAULT_PAGINATE' => env('DEFAULT_PAGINATE', 15),
    'ALLOWED_DESIGNATION_IDS' => env('ALLOWED_DESIGNATION_IDS', 50),
    'DESIGNATION_ID_TO_SHOW' => env('DESIGNATION_ID_TO_SHOW', ''),
    'RMAIL_RECEIVER_ID' => env('RMAIL_RECEIVER_ID', ''),

    'PTA_DESIGNATION_ID' => env('PTA_DESIGNATION_ID', 7),

    'NOTICES_FOR_ONE_DAY_LEAVE' => env('NOTICES_FOR_ONE_DAY_LEAVE', 7),
    'NOTICES_FOR_TWO_DAY_LEAVE' => env('NOTICES_FOR_TWO_DAY_LEAVE', 14),
    'NOTICES_FOR_ONE_WEEK_LEAVE' => env('NOTICES_FOR_ONE_WEEK_LEAVE', 30),

    'HALF_DAY_LEAVE_COUNT_DATE' => env('HALF_DAY_LEAVE_COUNT_DATE', 15),

    'HALF_DAY_LEAVE_HOURS' => env('HALF_DAY_LEAVE_HOURS', 7),
    'FULL_DAY_LEAVE_HOURS' => env('FULL_DAY_LEAVE_HOURS', 3),

    'HALF_DAY_LEVAE_TYPE' => env('HALF_DAY_LEVAE_TYPE', 0),
    'FULL_DAY_LEAVE_TYPE' => env('FULL_DAY_LEAVE_TYPE', 1),
    'MULTIPLE_DAY_LEAVE_TYPE' => env('MULTIPLE_DAY_LEAVE_TYPE', 2),

    'EARLY_LEAVING_REPORT_FULL_DAY' => env('EARLY_LEAVING_REPORT_FULL_DAY', 8.50),
    'EARLY_LEAVING_REPORT_HALF_DAY' => env('EARLY_LEAVING_REPORT_HALF_DAY', 4.50),

    'IN_HOURS_REOPRT' => env('IN_HOURS_REOPRT', 8.50),

    'IPS_CONNECT_LIVE_URL' => env('IPS_CONNECT_LIVE_URL', 'http://ips-connect.itpathsolutions.com:88/'),

    'LIGHTHOUSE_PROJECT_ID' => env('LIGHTHOUSE_PROJECT_ID', ''),
    'LIGHTHOUSE_DELIVERABLE_ID' => env('LIGHTHOUSE_DELIVERABLE_ID', ''),
    'LIGHTHOUSE_LOG_ENDPOINT' => env('LIGHTHOUSE_LOG_ENDPOINT', 'https://api.huntglitch.com/'),

    'SLACK_CALLBACK_URL' => env('SLACK_CALLBACK_URL'),
    'SLACK_CLIENT_ID' => env('SLACK_CLIENT_ID'),
    'SLACK_CLIENT_SECRET' => env('SLACK_CLIENT_SECRET'),

    'DOCUMENT_ALLOWED_EXTENSIONS' => env('DOCUMENT_ALLOWED_EXTENSIONS'),
    'DOCUMENT_MAX_FILE_SIZE' => env('DOCUMENT_MAX_FILE_SIZE'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | your application so that it is used when running Artisan tasks.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    'asset_url' => env('ASSET_URL'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. We have gone
    | ahead and set this to a sensible default for you out of the box.
    |
    */

    'timezone' => 'Asia/Kolkata',

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by the translation service provider. You are free to set this value
    | to any of the locales which will be supported by the application.
    |
    */

    'locale' => 'en',

    /*
    |--------------------------------------------------------------------------
    | Application Fallback Locale
    |--------------------------------------------------------------------------
    |
    | The fallback locale determines the locale to use when the current one
    | is not available. You may change the value to correspond to any of
    | the language folders that are provided through your application.
    |
    */

    'fallback_locale' => 'en',

    /*
    |--------------------------------------------------------------------------
    | Faker Locale
    |--------------------------------------------------------------------------
    |
    | This locale will be used by the Faker PHP library when generating fake
    | data for your database seeds. For example, this will be used to get
    | localized telephone numbers, street address information and more.
    |
    */

    'faker_locale' => 'en_US',

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is used by the Illuminate encrypter service and should be set
    | to a random, 32 character string, otherwise these encrypted strings
    | will not be safe. Please do this before deploying an application!
    |
    */

    'key' => env('APP_KEY'),

    'cipher' => 'AES-256-CBC',

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => 'file',
        // 'store'  => 'redis',
    ],

    /*
    |--------------------------------------------------------------------------
    | Autoloaded Service Providers
    |--------------------------------------------------------------------------
    |
    | The service providers listed here will be automatically loaded on the
    | request to your application. Feel free to add your own services to
    | this array to grant expanded functionality to your applications.
    |
    */

    'providers' => [

        /*
         * Laravel Framework Service Providers...
         */
        Illuminate\Auth\AuthServiceProvider::class,
        Illuminate\Broadcasting\BroadcastServiceProvider::class,
        Illuminate\Bus\BusServiceProvider::class,
        Illuminate\Cache\CacheServiceProvider::class,
        Illuminate\Foundation\Providers\ConsoleSupportServiceProvider::class,
        Illuminate\Cookie\CookieServiceProvider::class,
        Illuminate\Database\DatabaseServiceProvider::class,
        Illuminate\Encryption\EncryptionServiceProvider::class,
        Illuminate\Filesystem\FilesystemServiceProvider::class,
        Illuminate\Foundation\Providers\FoundationServiceProvider::class,
        Illuminate\Hashing\HashServiceProvider::class,
        Illuminate\Mail\MailServiceProvider::class,
        Illuminate\Notifications\NotificationServiceProvider::class,
        Illuminate\Pagination\PaginationServiceProvider::class,
        Illuminate\Pipeline\PipelineServiceProvider::class,
        Illuminate\Queue\QueueServiceProvider::class,
        Illuminate\Redis\RedisServiceProvider::class,
        Illuminate\Auth\Passwords\PasswordResetServiceProvider::class,
        Illuminate\Session\SessionServiceProvider::class,
        Illuminate\Translation\TranslationServiceProvider::class,
        Illuminate\Validation\ValidationServiceProvider::class,
        Illuminate\View\ViewServiceProvider::class,

        /*
         * Package Service Providers...
         */

        /*
         * Application Service Providers...
         */
        App\Providers\AppServiceProvider::class,
        App\Providers\AuthServiceProvider::class,
        App\Providers\BroadcastServiceProvider::class,
        App\Providers\EventServiceProvider::class,
        App\Providers\RouteServiceProvider::class,
        App\Providers\GlobalScopeServiceProvider::class,
        Spatie\Permission\PermissionServiceProvider::class,

    ],

    /*
    |--------------------------------------------------------------------------
    | Class Aliases
    |--------------------------------------------------------------------------
    |
    | This array of class aliases will be registered when this application
    | is started. However, feel free to register as many as you wish as
    | the aliases are "lazy" loaded so they don't hinder performance.
    |
    */

    'aliases' => Facade::defaultAliases()->merge([
        // 'ExampleClass' => App\Example\ExampleClass::class,
        'Redis' => Illuminate\Support\Facades\Redis::class,
    ])->toArray(),

];

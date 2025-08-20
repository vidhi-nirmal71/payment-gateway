<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maintenance Mode</title>
        <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/core.css?v=0.026" class="template-customizer-core-css" />
        <link rel="stylesheet" href="{{ asset('admin') }}/vendor/css/theme-default.css?v=0.1" class="template-customizer-theme-css" />

        <style>
            .misc-wrapper {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: calc(100vh - 1.625rem*2);
                text-align: center
            }
            body {
                margin: 0;
                font-family: var(--bs-body-font-family);
                font-size: var(--bs-body-font-size);
                font-weight: var(--bs-body-font-weight);
                line-height: var(--bs-body-line-height);
                color: var(--bs-body-color);
                text-align: var(--bs-body-text-align);
                background-color: #ffffff;
                -webkit-text-size-adjust: 100%;
                -webkit-tap-highlight-color: rgba(67,89,113,0)
            }
        </style>
    </head>

    <body>
        <div class="container-xxl container-p-y">
            <div class="misc-wrapper">
                <h2 class="mb-2 mx-2">Under Maintenance!</h2>
                <p class="mb-4 mx-2">Sorry for the inconvenience but we're performing some maintenance at the moment</p>
                <div class="mt-4">
                    <img src="{{ asset('img/under_maintenance.gif') }}" alt="doing-yoga-light" width="500" class="img-fluid">
                </div>
            </div>
        </div>
    </body>
</html>
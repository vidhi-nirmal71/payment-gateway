<?php

return [

    'types' => [

        'single_holiday' => [
            'title' => 'Single Holiday',
            'vars' => [
                '[DATE_ONE]',
            ],
        ],

        'multiple_holiday' => [
            'title' => 'Multiple Holiday',
            'vars' => [
                '[DATE_ONE]', '[DATE_TWO]',
            ],
        ],

        'new_blog' => [
            'title' => 'New Blog',
            'vars' => [
                '[BLOG_TITLE]', '[BLOG_URL]',
            ],
        ],

        'feedback' => [
            'title' => 'Feedback',
            'vars' => [],
        ],

    ],

    'template_variables' => [
        '[DATE_ONE]' => ['type' => 'date', 'name' => 'date_one'],
        '[DATE_TWO]' => ['type' => 'date', 'name' => 'date_two'],
        '[BLOG_TITLE]' => ['type' => 'text', 'name' => 'blog_title'],
        '[BLOG_URL]' => ['type' => 'text', 'name' => 'blog_url'],
    ],
];

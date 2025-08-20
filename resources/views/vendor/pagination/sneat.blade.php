@if ($paginator->hasPages())
    <nav aria-label="Page navigation">
        <ul class="pagination">

            {{-- Previous Page Link --}}
            @if ($paginator->onFirstPage())
                <li class="disabled page-item prev">
                    <a class="page-link" href="javascript:void(0);">
                        <i class="tf-icon bx bx-chevron-left"></i>
                    </a>
                </li>
            @else
                <li class="page-item prev">
                    <a class="page-link btnClick" data-url="{{ $paginator->previousPageUrl() }}" href="javascript:void(0);">
                        <i class="tf-icon bx bx-chevron-left"></i>
                    </a>
                </li>
            @endif

            {{-- Pagination Elements --}}
            @foreach ($elements as $element)
                {{-- "Three Dots" Separator --}}
                @if (is_string($element))
                    <li class="page-item disabled" aria-disabled="true"><span>{{ $element }}</span></li>
                @endif

                {{-- Array Of Links --}}
                @if (is_array($element))
                    @foreach ($element as $page => $url)
                        @if ($page == $paginator->currentPage())
                            <li class=" page-item active" aria-current="page">
                                <a class="page-link" data-url="{{ $url }}" href="javascript:void(0);">{{ $page }}</a>
                            </li>
                        @else
                            <li class="page-item"><a class="page-link btnClick" data-url="{{ $url }}" href="javascript:void(0);">{{ $page }}</a></li>
                        @endif
                    @endforeach
                @endif
            @endforeach

            {{-- Next Page Link --}}
            @if ($paginator->hasMorePages())
                <li class="page-item next">
                    <a class="page-link btnClick" data-url="{{ $paginator->nextPageUrl() }}" href="javascript:void(0);">
                        <i class="tf-icon bx bx-chevron-right"></i>
                    </a>
                </li>
            @else
                <li class="page-item next disabled">
                    <a class="page-link" href="javascript:void(0);">
                        <i class="tf-icon bx bx-chevron-right"></i>
                    </a>
                </li>
            @endif
        </ul>
    </nav>
@endif

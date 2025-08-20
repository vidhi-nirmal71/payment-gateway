<div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true" style="display: none;" data-bs-backdrop="static">
    <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="formTitle">Add New User</h5>
                <button type="button" class="btn-close common-close-button" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                  {{-- Including from element here --}}
                  @include('admin.user.form-element')
                </div>
            </div>
        </div>
    </div>
</div>

@extends('admin.layout.master', ['title' => 'Team Distribution Information'])

@section('head')
	<style>
		#assignedPta{
			margin:0 auto;
		}
		.assignedEmployeeList{
			padding-left: 0.5rem;
		}
		.d-none{
			display: none !important;
		}
		.emp_name{
			cursor: pointer;
		}
		.underline-tight {
            border-bottom: 1px solid #ccc;
            line-height: 1;
        }
	</style>
@endsection

@section('content')
	<div class="row">
		<div class="card mb-4">
			<div class="card-body">
				@if ($usernotHavePtaList !== [])
					<div class="col-xl">
						<div class="row mb-3">
							<h5 class="mb-3">Non Assigned Employee ({{ $usernotHavePtaList !== [] ? count($usernotHavePtaList) : 0 }}) :-</h6>
							<div class="col-sm-12">
								<ol class="assignedEmployeeList">
									@foreach ($usernotHavePtaList as $key => $user)
									<div class="d-flex justify-content-start align-items-center mb-1">
										<div class="avatar-wrapper">
											<div class="avatar me-2">
												@if ($user['profile'] != null)
													<img src="{{ $user['profile'] }}" alt="Avatar" class="rounded-circle">
												@else
													@php
														$bgColors = ["bg-label-primary", "bg-label-success", "bg-label-info", "bg-label-warning", "bg-label-danger"];
														$bgColorClass = $bgColors[$key % count($bgColors)];
														$initials = '';
														$nameWords = explode(' ', $user['name'] ?? '');
														
														foreach ($nameWords as $word) {
															$initials .= strtoupper(substr($word, 0, 1));
														}
													@endphp
													<span class="avatar-initial rounded-circle {{ $bgColorClass }}">{{ $initials }}</span>
												@endif
											</div>
										</div>
										<div class="d-flex flex-column">
											<span class="emp_name text-truncate underline-tight" data-id={{$key}} title="{{ $user['name'] ?? '' }}">{{ $user['name'] ?? '' }} {{ $user['role'] ? ' - '.$user['role'] : '' }}</span>
										</div>
									</div>
									{{-- <li> {{ $user['name'] ?? '' }}</li> --}}
									@endforeach
								</ol>
							</div>
						</div>
					</div>
				@endif

				<div class="row">

					@foreach ($userIdsByPtaUserId as $key => $item)
						<div class="accordion stick-top accordion-bordered course-content-fixed" id="mainAccordion-{{$key}}">
							<div class="accordion-item shadow-none border mb-4 active">
								<div class="accordion-header main-header" id="heading-{{$key}}">
									<button type="button" class="accordion-button bg-label-primary rounded-0" data-bs-toggle="collapse" data-bs-target="#chapter-{{$key}}" aria-expanded="true" aria-controls="chapter-{{$key}}">
										<span class="d-flex flex-column"> <span class="h5 mb-1 text-primary">{{ $item['ptaUser'] ?? '' }} ({{ $item['is_avp'] ? 'AVP' : 'PTA'}})</span> </span>
									</button>
								</div>
								<div id="chapter-{{$key}}" class="accordion-collapse collapse show">
									<div class="accordion-body py-3 border-top">
										<div class="d-flex main-content">
											@include('admin.user.sub-team-destribution')
										</div>

										@if($item['is_avp'] && !empty($item['assigned_pta']))
											@foreach($item['assigned_pta'] as $k => $item)
												<div class="col-12">
													<div class="accordion stick-top accordion-bordered course-content-fixed" id="assignedPta-{{$k}}">
														<div class="accordion-item shadow-none border mb-0">
															<div class="accordion-header" id="heading-{{$k}}">
																<button type="button" class="accordion-button bg-label-secondary rounded-0" data-bs-toggle="collapse" data-bs-target="#chapter-{{$k}}" aria-expanded="false" aria-controls="chapter-{{$k}}">
																	<span class="d-flex flex-column"> <span class="h6 mb-1">{{ $item['ptaUser'] ?? '' }} ({{ $item['is_avp'] ? 'AVP' : 'PTA'}})</span> </span>
																</button>
															</div>
															<div id="chapter-{{$k}}" class="accordion-collapse collapse show">
																<div class="accordion-body py-3 border-top">
																	<div class="d-flex">
																		@include('admin.user.sub-team-destribution')
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											@endforeach
										@endif
									</div>
								</div>
							</div>
						</div>
					@endforeach

				</div>
			</div>
		</div>
	</div>

	{{-- User info model --}}
	<div class="modal fade" id="userInfoModel" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
		<div class="modal-dialog modal-md" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">User Information</h5>
					<button type="button" class="btn-close common-close-button" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<div class="row">
						<div class="col-sm-12">
							<ul class="list-unstyled">
								<li class="d-flex align-items-center mb-2"><i class="bx bx-user"></i><span class="fw-medium mx-2">Name:</span> <span id="empName"></span></li>
								<li class="d-flex align-items-center mb-2"><i class='bx bxs-user-badge'></i><span class="fw-medium mx-2">PTA/AVP:</span> <span id="empPta"></span></li>
								<li class="d-flex align-items-center mb-2"><i class="bx bx-code-alt"></i><span class="fw-medium mx-2">Technologies:</span> <span id="empTech"></span></li>
								<li class="d-flex align-items-center mb-2"><i class="bx bx-crown"></i><span class="fw-medium mx-2">Designation:</span> <span id="empRole"></span></li>
								<li class="d-flex align-items-center"><i class='bx bx-calendar-star'></i><span class="fw-medium mx-2">Experience:</span> <span id="empExp"></span></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
@endsection

@section('script')
	<script src="{{ asset('admin/js/custom/team-distribution.js') }}?v=0.01"></script>
@endsection
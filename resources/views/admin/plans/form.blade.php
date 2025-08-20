<div class="row g-3">
  <div class="col-md-6">
    <label class="form-label">Name</label>
    <input name="name" class="form-control" value="{{ old('name', $plan->name ?? '') }}" required>
    @error('name')<small class="text-danger">{{ $message }}</small>@enderror
  </div>
  <div class="col-md-6 form-group">
      <label>Interval</label>
      <select name="interval" class="form-control" required>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
      </select>
  </div>
  <div class="col-md-6">
      <label class="form-label">Price</label>
      <input type="number" step="0.01" name="price" class="form-control" value="{{ old('price', $plan->price ?? '') }}" required>
      @error('price')<small class="text-danger">{{ $message }}</small>@enderror
  </div>
  <div class="col-md-6">
      <label class="form-label">Currency</label>
      <input type="text" name="currency" value="usd" class="form-control" value="{{ old('currency', $plan->currency ?? '') }}" required>
      @error('currency')<small class="text-danger">{{ $message }}</small>@enderror
  </div>
  <div class="col-md-12">
    <label class="form-label">Description</label>
    <input name="description" class="form-control" value="{{ old('description', $plan->description ?? '') }}">
    @error('description')<small class="text-danger">{{ $message }}</small>@enderror
  </div>
  <div class="col-12 mt-2">
    <button class="btn btn-primary">{{ $button }}</button>
  </div>
</div>
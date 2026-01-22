<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CustomerController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of customers.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        $query = Customer::query();

        // Search by name, email, or phone
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $normalizedSearch = preg_replace('/[^0-9]/', '', $search);

            $query->where(function ($q) use ($search, $normalizedSearch) {
                $q->where('name', 'like', "%{$search}%");
                if ($normalizedSearch) {
                    $q->orWhere('phone', 'like', "%{$normalizedSearch}%");
                }
                $q->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('name')->paginate($request->get('per_page', 15));

        return CustomerResource::collection($customers);
    }

    /**
     * Store a newly created customer.
     */
    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());

        return new CustomerResource($customer);
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer)
    {
        $this->authorize('view', $customer);

        $customer->load([
            'workOrders' => function ($query) {
                $query->with('creator')->orderBy('created_at', 'desc');
            }
        ]);

        return new CustomerResource($customer);
    }

    /**
     * Update the specified customer.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return new CustomerResource($customer);
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer)
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        return response()->json(['message' => 'Customer deleted successfully'], 200);
    }
}

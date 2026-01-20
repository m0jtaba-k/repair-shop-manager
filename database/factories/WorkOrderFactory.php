<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkOrder>
 */
class WorkOrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = WorkOrder::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['new', 'in_progress', 'waiting_customer', 'done', 'cancelled'];
        $priorities = ['low', 'medium', 'high'];

        return [
            'customer_id' => Customer::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->optional(0.8)->paragraph(),
            'status' => fake()->randomElement($statuses),
            'priority' => fake()->randomElement($priorities),
            'due_at' => fake()->optional(0.5)->dateTimeBetween('now', '+30 days'),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the work order is new.
     */
    public function new($attributes = []): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'new',
        ]);
    }

    /**
     * Indicate that the work order is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'in_progress',
        ]);
    }

    /**
     * Indicate that the work order is done.
     */
    public function done(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'done',
        ]);
    }

    /**
     * Indicate that the work order has high priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn(array $attributes) => [
            'priority' => 'high',
        ]);
    }
}

<?php

namespace Database\Factories;

use App\Models\StatusHistory;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StatusHistory>
 */
class StatusHistoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = StatusHistory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['new', 'in_progress', 'waiting_customer', 'done', 'cancelled'];

        return [
            'work_order_id' => WorkOrder::factory(),
            'from_status' => fake()->randomElement([null, ...$statuses]),
            'to_status' => fake()->randomElement($statuses),
            'changed_by' => User::factory(),
            'changed_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}

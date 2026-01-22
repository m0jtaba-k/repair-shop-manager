<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\NotificationLog;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationLog>
 */
class NotificationLogFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = NotificationLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['queued', 'sent', 'failed'];
        $status = fake()->randomElement($statuses);

        return [
            'work_order_id' => WorkOrder::factory(),
            'customer_id' => Customer::factory(),
            'channel' => 'email',
            'payload' => [
                'subject' => fake()->sentence(),
                'body' => fake()->paragraph(),
                'to' => fake()->email(),
            ],
            'sent_at' => $status === 'sent' ? fake()->dateTimeBetween('-7 days', 'now') : null,
            'status' => $status,
            'error' => $status === 'failed' ? fake()->sentence() : null,
            'created_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ];
    }

    /**
     * Indicate that the notification was sent.
     */
    public function sent(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'sent',
            'sent_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'error' => null,
        ]);
    }

    /**
     * Indicate that the notification failed.
     */
    public function failed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'failed',
            'sent_at' => null,
            'error' => fake()->sentence(),
        ]);
    }

    /**
     * Indicate that the notification is queued.
     */
    public function queued(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'queued',
            'sent_at' => null,
            'error' => null,
        ]);
    }
}

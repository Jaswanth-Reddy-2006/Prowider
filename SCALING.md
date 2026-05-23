# Scaling Evolution Roadmap

The current architecture guarantees consistency using explicit PostgreSQL row-level locks (`SELECT FOR UPDATE`). This is highly robust up to approximately 500-1000 Transactions Per Second (TPS), depending on the database hardware and connection pooling limits.

## When to Evolve
If peak traffic sustains over 1,000 requests per second, row-lock contention will force database timeouts and connection exhaustion, even with PgBouncer.

## Evolution Strategy: The Async Event Queue

When scaling beyond database capabilities, the system must shift from **Synchronous** (blocking) allocation to **Asynchronous** (event-driven) allocation.

### 1. Ingestion Layer (API)
- `POST /api/leads` no longer executes database transactions.
- Instead, it performs basic Zod validation and instantly pushes the payload to a high-throughput message queue (e.g., Apache Kafka or Redis Streams).
- The API returns `202 Accepted` immediately with a Job ID, rather than `201 Created` with the allocation payload.

### 2. Processing Layer (Workers)
- A fleet of dedicated backend worker nodes (Node.js, Rust, or Go) consumes messages from the queue.
- To prevent deadlocks, workers can use **Redis Distributed Locks** (Redlock algorithm) to acquire locks on the specific providers needed for the lead before performing the database decrements.
- Alternatively, partitions in Kafka can be mapped by `serviceId`, ensuring that all leads for a specific service are processed strictly sequentially by a single worker, entirely eliminating the need for database locking.

### 3. Real-Time Propagation
- Once the worker commits the assignment to the database, it publishes a payload to a Redis Pub/Sub channel.
- The Next.js API instances (which manage the SSE connections) subscribe to this Redis channel and fan out the update to the connected clients in real-time.

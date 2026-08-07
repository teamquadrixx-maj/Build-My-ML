# ML Deployment Patterns

Common deployment approaches depending on use case:

- Real-time REST API: use when predictions are needed instantly in response to user/system events (e.g. fraud check during a transaction). Typically built with FastAPI/Flask and containerized with Docker.
- Batch scoring: use when predictions can be precomputed on a schedule (e.g. daily churn risk scores). Cheaper and simpler than real-time serving.
- Streaming inference: use when predictions must be made continuously on event streams (e.g. Kafka pipelines), typically for high-throughput, low-latency use cases.
- Model registry and versioning: track model versions, metrics, and rollback capability (e.g. MLflow) regardless of deployment style.
- Monitoring: track prediction drift, input data drift, and performance decay over time; retrain on a schedule or when drift is detected.

Rule of thumb: default to batch scoring for most business analytics use cases (it's simpler and cheaper) unless the product requires sub-second predictions at request time.

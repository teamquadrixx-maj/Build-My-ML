# Choosing Evaluation Metrics

The right metric depends on the problem type and business context.

Classification:
- Accuracy: only appropriate for balanced classes.
- Precision: important when false positives are costly (e.g. flagging legitimate transactions as fraud).
- Recall: important when false negatives are costly (e.g. missing an actual churner or a disease case).
- F1-score: balances precision and recall, useful when both matter.
- ROC AUC: measures overall ranking ability across thresholds, good default for imbalanced binary classification.
- PR AUC: more informative than ROC AUC when the positive class is rare.

Regression:
- RMSE: penalizes large errors more heavily, use when large mistakes are especially costly.
- MAE: more robust to outliers, easier to interpret in the original unit.
- R²: proportion of variance explained, useful for communicating model fit to stakeholders.

Rule of thumb: always pick metrics that map to the actual business cost of errors, not just the default choice for the problem type.

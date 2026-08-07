# Handling Imbalanced Data

Common in fraud detection, churn prediction, and rare-event classification, where one class vastly outnumbers the other.

Techniques:
- Resampling: oversample the minority class (SMOTE) or undersample the majority class.
- Class weighting: most models (XGBoost, sklearn classifiers) support a `class_weight` or `scale_pos_weight` parameter to penalize misclassifying the minority class more heavily.
- Threshold tuning: instead of the default 0.5 probability cutoff, tune the decision threshold based on precision/recall tradeoffs relevant to the business problem.
- Evaluation: never rely on accuracy alone for imbalanced problems. Use ROC AUC, PR AUC, precision, recall, and F1-score instead, since accuracy can be misleading when one class dominates.

Rule of thumb: for churn, fraud, or any minority-class prediction problem, always mention class imbalance handling and use ROC AUC or PR AUC as the primary metric, not raw accuracy.

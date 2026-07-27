# Machine Learning Evaluation Metrics

## Overview

Evaluation metrics measure how well a machine learning model performs.

The correct metric depends on:

- Type of ML problem
- Dataset characteristics
- Class distribution
- Importance of different types of errors
- Business or project objective

A model should not be selected simply because it has the highest value for one arbitrary metric.

---

# Classification Metrics

Classification metrics evaluate models that predict categorical outcomes.

Examples include:

- Fraud / Not Fraud
- Churn / No Churn
- Spam / Not Spam
- Disease / No Disease

## Confusion Matrix

A confusion matrix summarises classification predictions using:

### True Positive (TP)

The model predicts positive and the actual class is positive.

Example:

A fraudulent transaction is correctly predicted as fraud.

### True Negative (TN)

The model predicts negative and the actual class is negative.

Example:

A legitimate transaction is correctly predicted as legitimate.

### False Positive (FP)

The model predicts positive but the actual class is negative.

Example:

A legitimate transaction is incorrectly marked as fraud.

This is also called a false alarm.

### False Negative (FN)

The model predicts negative but the actual class is positive.

Example:

A fraudulent transaction is incorrectly predicted as legitimate.

The importance of false positives and false negatives depends on the application.

---

## Accuracy

Accuracy measures the proportion of predictions that are correct.

Accuracy = Correct Predictions / Total Predictions

Accuracy can be useful when classes are reasonably balanced and different types of errors have similar importance.

However, accuracy can be misleading for imbalanced datasets.

Example:

Suppose:

- 990 transactions are legitimate.
- 10 transactions are fraudulent.

A model predicting every transaction as legitimate achieves 99% accuracy while detecting no fraud.

Therefore, accuracy should not be used alone for strongly imbalanced classification problems.

---

## Precision

Precision measures how many observations predicted as positive are actually positive.

Precision = TP / (TP + FP)

High precision means the model produces relatively few false-positive predictions.

Precision can be important when false positives are costly.

Example:

If a system automatically blocks transactions predicted as fraudulent, excessive false positives could block legitimate customers.

---

## Recall

Recall measures how many actual positive observations are correctly identified.

Recall = TP / (TP + FN)

Recall is also called sensitivity in some contexts.

High recall means the model misses relatively few positive cases.

Recall can be important when false negatives are costly.

Example:

In fraud detection, failing to identify fraudulent transactions may cause financial loss.

---

## F1-Score

F1-score combines precision and recall using their harmonic mean.

F1 = 2 × (Precision × Recall) / (Precision + Recall)

F1-score can be useful when both false positives and false negatives matter and a balance between precision and recall is desired.

---

## Specificity

Specificity measures the proportion of actual negative observations correctly identified.

Specificity = TN / (TN + FP)

It can be useful when correctly identifying negative cases is important.

---

## ROC Curve

The Receiver Operating Characteristic curve evaluates a binary classifier across different decision thresholds.

It compares:

- True Positive Rate
- False Positive Rate

Changing the classification threshold changes the balance between detecting positives and producing false positives.

---

## ROC-AUC

ROC-AUC represents the area under the ROC curve.

It summarises how well prediction scores rank positive observations above negative observations across thresholds.

A higher ROC-AUC generally indicates better discrimination.

However, ROC-AUC should not automatically be the only metric used, especially for strongly imbalanced problems.

---

## Precision-Recall Curve

A Precision-Recall curve shows the trade-off between precision and recall across different classification thresholds.

It can be particularly informative when the positive class is rare.

For highly imbalanced problems such as fraud detection, precision-recall based evaluation may provide useful information that overall accuracy hides.

---

## Classification Threshold

Many binary classifiers produce a score or probability rather than directly producing a final class.

For example:

Fraud probability = 0.73

A threshold converts the score into a class.

Example:

Probability >= 0.5 → Fraud

Probability < 0.5 → Not Fraud

The default threshold is not necessarily optimal for every application.

The threshold may be selected according to:

- Cost of false positives
- Cost of false negatives
- Required recall
- Required precision
- Business requirements

Threshold selection should be performed using appropriate validation data rather than the final test set.

---

## Multiclass Evaluation

For multiclass classification, metrics such as precision, recall and F1 can be calculated separately for each class and then combined.

Common averaging strategies include:

### Macro Average

Calculate the metric independently for each class and take the unweighted average.

Each class contributes equally.

This can be useful when performance on minority classes is important.

### Weighted Average

Calculate the metric for each class and average according to the number of observations in each class.

Larger classes therefore contribute more to the final score.

### Micro Average

Aggregate contributions across classes before calculating the metric.

The appropriate averaging strategy depends on the problem and class distribution.

---

# Regression Metrics

Regression metrics evaluate models that predict numerical values.

Examples include:

- House prices
- Sales
- Temperature
- Energy consumption
- Delivery time

---

## Mean Absolute Error (MAE)

MAE measures the average absolute difference between actual and predicted values.

MAE = average(|Actual - Predicted|)

Example:

Actual house price: 500,000

Predicted price: 470,000

Absolute error: 30,000

MAE is relatively easy to interpret because it is expressed in the same units as the target.

Lower MAE generally indicates better predictive accuracy.

---

## Mean Squared Error (MSE)

MSE measures the average squared difference between actual and predicted values.

MSE = average((Actual - Predicted)²)

Because errors are squared, large errors receive a stronger penalty.

MSE can therefore be useful when large prediction errors are particularly undesirable.

However, its units are squared relative to the target, making it less directly interpretable.

---

## Root Mean Squared Error (RMSE)

RMSE is the square root of MSE.

RMSE = sqrt(MSE)

RMSE is expressed in the same units as the target variable.

Like MSE, RMSE gives relatively greater influence to larger errors compared with MAE.

Lower RMSE generally indicates better predictive performance.

---

## R-Squared (R²)

R² measures model performance relative to a baseline that predicts the mean target value.

A value closer to 1 generally indicates that the model explains more of the variation in the target.

A value around 0 indicates performance similar to predicting the mean under the standard definition.

R² can also be negative when a model performs worse than that baseline.

R² should not be used alone to determine whether a regression model is suitable.

Error metrics such as MAE or RMSE should also be considered where appropriate.

---

## MAE vs RMSE

MAE and RMSE measure prediction error differently.

### MAE

- Easier to interpret.
- Gives errors linear weight.
- Less influenced by very large errors than RMSE.

### RMSE

- Penalises large errors more strongly.
- Useful when large prediction mistakes are particularly undesirable.

The correct metric depends on the application.

---

# Clustering Evaluation Metrics

Clustering is usually unsupervised, so true class labels may not be available.

Evaluation therefore often measures properties such as cluster compactness and separation.

---

## Silhouette Score

The Silhouette Coefficient considers:

- How similar an observation is to its own cluster.
- How separated it is from neighbouring clusters.

Values closer to 1 generally indicate well-separated clusters.

Values around 0 may indicate overlapping clusters.

Negative values may indicate observations assigned to unsuitable clusters.

---

## Calinski-Harabasz Score

The Calinski-Harabasz score compares separation between clusters with compactness within clusters.

Higher values generally indicate clusters that are more separated and internally compact.

It can be useful for comparing clustering configurations on the same dataset.

---

## Davies-Bouldin Score

The Davies-Bouldin score evaluates cluster similarity based on within-cluster scatter and separation between clusters.

Lower values generally indicate better-separated clusters.

---

## Clustering Metrics Are Not Enough

A numerically strong clustering score does not automatically mean the discovered groups are useful.

Clusters should also be evaluated using:

- Domain knowledge
- Interpretability
- Stability
- Practical usefulness

For example, customer segments should correspond to meaningful differences that can actually support business decisions.

---

# Choosing the Correct Metric

The metric should match the objective.

## Example 1: Fraud Detection

Suppose fraudulent transactions are rare.

Accuracy alone could be misleading.

Useful metrics may include:

- Precision
- Recall
- F1-score
- Precision-Recall based metrics
- ROC-AUC where appropriate

If missing fraud is extremely costly, recall may receive greater attention.

---

## Example 2: Spam Detection

If legitimate emails being classified as spam is particularly undesirable, false positives matter.

Precision for the spam class may therefore be important.

---

## Example 3: Disease Screening

If failing to detect a positive case has serious consequences, recall or sensitivity may be especially important.

Other clinical considerations would also be required in a real medical system.

---

## Example 4: House Price Prediction

Possible metrics include:

- MAE
- RMSE
- R²

MAE gives an interpretable average absolute prediction error.

RMSE places greater emphasis on large prediction errors.

---

## Example 5: Customer Segmentation

Possible clustering metrics include:

- Silhouette Score
- Calinski-Harabasz Score
- Davies-Bouldin Score

However, the resulting customer groups must also be meaningful and useful.

---

# Training Metrics vs Validation Metrics

Training performance alone should not be used to select a model.

Example:

Training accuracy: 99%

Validation accuracy: 72%

This may indicate overfitting or another generalisation problem.

Model performance should be measured using data not used to fit that model.

---

# Cross-Validation Metrics

Cross-validation produces performance measurements across multiple validation folds.

For example:

Fold 1 F1: 0.84
Fold 2 F1: 0.81
Fold 3 F1: 0.86
Fold 4 F1: 0.83
Fold 5 F1: 0.82

The mean and variability across folds can provide more information than a single train/validation split.

Large variation between folds can indicate unstable model performance or sensitivity to the data split.

---

# Metric Selection for Imbalanced Data

For imbalanced classification problems, BuildMyML should inspect:

- Class distribution
- False-positive cost
- False-negative cost
- Precision
- Recall
- F1
- Threshold behaviour
- Precision-Recall performance
- ROC-AUC when appropriate

It should not automatically recommend accuracy as the primary metric.

---

# Multiple Metrics

Sometimes model evaluation should consider several metrics.

Example:

Fraud detection:

Primary objective:
Recall

Secondary considerations:
Precision
F1
ROC-AUC or Precision-Recall performance

A model with slightly lower overall accuracy could still be preferable if it detects substantially more important positive cases.

---

# Model Comparison

Models should be compared using:

- The same dataset splits
- The same validation strategy
- Appropriate preprocessing
- The same primary evaluation metric
- Comparable experimental conditions

Comparing scores produced under different evaluation setups can be misleading.

---

# Common Evaluation Mistakes

Common mistakes include:

- Evaluating only on training data.
- Using accuracy alone for highly imbalanced classification.
- Selecting metrics unrelated to the actual project objective.
- Tuning repeatedly against the final test set.
- Comparing models using different validation splits.
- Ignoring false-positive and false-negative costs.
- Assuming a high R² guarantees a useful regression model.
- Ignoring variability across cross-validation folds.
- Using clustering metrics without checking whether clusters are meaningful.
- Choosing a classification threshold using the final test set.

---

# Recommended Evaluation Workflow

A general workflow is:

Identify ML Task
    ↓
Understand Real-World Objective
    ↓
Identify Important Error Types
    ↓
Select Primary Metric
    ↓
Select Supporting Metrics
    ↓
Choose Validation Strategy
    ↓
Train Candidate Models
    ↓
Evaluate Using Validation/Cross-Validation
    ↓
Compare Models
    ↓
Select Model
    ↓
Final Evaluation on Held-Out Test Data

---

# BuildMyML Evaluation Principles

BuildMyML should not simply say:

"Use accuracy."

Instead, it should reason about the project.

For classification, consider:

- Is the dataset balanced?
- Are false positives costly?
- Are false negatives costly?
- Is probability ranking important?
- Is threshold selection important?

For regression, consider:

- Should large errors receive stronger penalties?
- Is interpretability of the error important?
- What are the units of the target?

For clustering, consider:

- Are clusters compact?
- Are they separated?
- Are they stable?
- Are they meaningful for the application?

The evaluation strategy should therefore be selected according to the machine learning task and project objective.

---

# Sources

Primary references:

- Scikit-learn User Guide — Metrics and Scoring
- Scikit-learn User Guide — Classification Metrics
- Scikit-learn User Guide — Regression Metrics
- Scikit-learn User Guide — Clustering Performance Evaluation
- Scikit-learn User Guide — Cross-validation
- Scikit-learn User Guide — Model Selection
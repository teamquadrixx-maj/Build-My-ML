# Model Selection

## Overview

Model selection is the process of choosing an appropriate machine learning model for a particular problem and dataset.

There is no single machine learning algorithm that performs best for every problem. The appropriate model depends on factors such as:

- Type of machine learning task
- Dataset size
- Feature types
- Data quality
- Linear or nonlinear relationships
- Class imbalance
- Interpretability requirements
- Training time
- Prediction speed
- Computational resources
- Required predictive performance

A good model selection process compares multiple suitable candidate models using reliable validation methods instead of selecting a model only because it is popular.

---

## Step 1: Identify the Machine Learning Task

Before selecting a model, determine the type of problem.

### Classification

Use classification when the target is categorical.

Examples:

- Fraud / Not Fraud
- Churn / No Churn
- Disease category
- Spam / Not Spam

Possible candidate models include:

- Logistic Regression
- Decision Tree
- Random Forest
- Support Vector Machine
- K-Nearest Neighbours
- Naive Bayes
- Gradient Boosting classifiers

### Regression

Use regression when the target is a continuous numerical value.

Examples:

- House price
- Sales amount
- Temperature
- Energy consumption
- Delivery time

Possible candidate models include:

- Linear Regression
- Ridge Regression
- Lasso Regression
- Decision Tree Regressor
- Random Forest Regressor
- Support Vector Regression
- K-Nearest Neighbours Regressor
- Gradient Boosting regressors

### Clustering

Use clustering when there is typically no labelled target and the objective is to discover groups in the data.

Examples:

- Customer segmentation
- Product grouping
- Behaviour analysis
- Document grouping

Possible algorithms include:

- K-Means
- Hierarchical/Agglomerative Clustering
- DBSCAN
- Mean Shift
- Gaussian Mixture Models

---

## Baseline Models

A baseline provides a simple reference point against which more sophisticated models can be compared.

For classification, a baseline might predict according to a simple strategy such as the most frequent class.

For regression, a baseline might predict the mean or median target value.

A simple machine learning model can also be useful as an initial modelling baseline.

For example:

Classification:
Logistic Regression

Regression:
Linear Regression

If a complicated model provides little improvement over a simple baseline, the additional complexity may not be justified.

---

## Train and Test Split

The dataset should be separated appropriately so that model performance can be measured on unseen data.

A basic workflow is:

Dataset
    ↓
Training Data
    +
Test Data

The training data is used to fit the model.

The test data is reserved for final evaluation.

The test set should not be repeatedly used to make model-selection decisions because doing so can indirectly overfit the development process to the test data.

---

## Validation Data

A validation set can be used during model development.

Conceptually:

Dataset
    ↓
Training Set
Validation Set
Test Set

Training Set:
Used to fit models.

Validation Set:
Used to compare models and tune hyperparameters.

Test Set:
Used for final evaluation after model-development decisions have been made.

Cross-validation can often be used instead of relying on one fixed validation split.

---

## Cross-Validation

Cross-validation evaluates a model using multiple train/validation splits.

A common method is K-Fold Cross-Validation.

For example, with 5 folds:

Fold 1 → Validation
Folds 2–5 → Training

Then:

Fold 2 → Validation
Remaining folds → Training

This continues until each fold has been used for validation.

The validation results are then combined to estimate model performance.

Cross-validation can provide a more robust estimate than relying on a single random validation split.

---

## Stratified Cross-Validation

For classification problems, particularly when classes are imbalanced, stratified splitting can help preserve approximately similar class proportions across folds.

For example:

Complete dataset:

90% Class A
10% Class B

A stratified split attempts to maintain approximately the same distribution in each fold.

This can produce more representative evaluation splits for classification.

---

## Time-Series Considerations

Ordinary random cross-validation may be inappropriate for time-dependent data.

For example, if the objective is to predict future sales, training on future observations while validating on earlier observations would create an unrealistic evaluation.

Time-based validation should preserve temporal order.

Conceptually:

Past
    ↓
Training
    ↓
Validation
    ↓
Future

The validation strategy must match how the model will actually be used.

---

## Comparing Candidate Models

Multiple suitable algorithms should be evaluated.

For a classification problem, a candidate set might include:

- Logistic Regression
- Decision Tree
- Random Forest
- Support Vector Machine

For regression:

- Linear Regression
- Ridge Regression
- Decision Tree Regressor
- Random Forest Regressor

Each model should be evaluated using the same appropriate validation procedure so the comparison is fair.

---

## Choosing Evaluation Metrics

The metric used for model selection should match the actual objective.

### Classification

Possible metrics include:

- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC
- Precision-Recall based metrics

For imbalanced classification, accuracy alone can be misleading.

Example:

99% normal transactions
1% fraud

A model predicting every transaction as normal achieves 99% accuracy but detects no fraud.

Therefore, metrics such as recall, precision and F1 may be more informative depending on the business objective.

### Regression

Possible metrics include:

- Mean Absolute Error (MAE)
- Mean Squared Error (MSE)
- Root Mean Squared Error (RMSE)
- R²

The correct metric depends on how prediction errors should be interpreted.

---

## Hyperparameters

Hyperparameters are configuration values chosen before or during model training rather than parameters directly learned from the training examples.

Examples include:

Random Forest:
- Number of trees
- Maximum tree depth
- Minimum samples per split

K-Nearest Neighbours:
- Number of neighbours
- Distance metric

Support Vector Machine:
- C
- Kernel
- Gamma

The best hyperparameter values depend on the dataset and problem.

---

## Hyperparameter Tuning

Hyperparameter tuning searches for model configurations that perform well according to a chosen validation procedure.

Common approaches include:

### Grid Search

Grid Search evaluates combinations from a predefined set of hyperparameter values.

Advantages:

- Simple
- Systematic

Disadvantages:

- Can become computationally expensive when many parameters and values are tested.

### Random Search

Random Search samples combinations from specified parameter distributions.

It can be more efficient than exhaustive grid search when the search space is large.

More advanced optimisation approaches can also be used when justified.

---

## Avoid Tuning on the Test Set

Hyperparameters should not be selected based on final test-set performance.

Incorrect:

Training
    ↓
Try model
    ↓
Check test
    ↓
Change hyperparameters
    ↓
Check same test again

Repeatedly using the test set influences model development and weakens its role as an unbiased final evaluation.

Instead:

Training Data
    ↓
Cross-Validation / Validation
    ↓
Model + Hyperparameter Selection
    ↓
Final Model
    ↓
Test Set ONCE for final evaluation

---

## Model Complexity

More complex models are not automatically better.

A highly complex model may fit the training data extremely well while performing poorly on unseen data.

This is known as overfitting.

A very simple model may fail to capture important patterns.

This is commonly associated with underfitting.

The goal is to choose a model that generalises well to unseen data.

---

## Bias and Variance

Model performance can be understood partly through the concepts of bias and variance.

### High Bias

A model may be too simple to represent important patterns.

Possible result:

Underfitting.

### High Variance

A model may be too sensitive to the training data.

Possible result:

Overfitting.

Model selection aims to find an appropriate balance for the problem.

---

## Interpretability

Sometimes the most accurate model is not necessarily the most appropriate model.

Interpretability may be important in domains where users need to understand why predictions are made.

Models such as:

- Linear Regression
- Logistic Regression
- Small Decision Trees

can often be easier to interpret than more complicated ensemble models.

The importance of interpretability depends on the application.

---

## Dataset Size

Dataset size can influence model selection.

Small datasets may not support highly complex models reliably.

Large datasets may allow more complex models but can increase:

- Training time
- Memory usage
- Hyperparameter search cost

Model complexity should be appropriate for the amount and quality of available data.

---

## Number of Features

Datasets with many features can create additional challenges.

Possible issues include:

- Increased computational cost
- Irrelevant features
- Redundant features
- Overfitting
- Difficulty interpreting models

Feature selection, regularisation, or dimensionality reduction may be considered when appropriate.

---

## Linear vs Nonlinear Relationships

Some models primarily represent linear relationships.

Examples:

- Linear Regression
- Logistic Regression

Other models can naturally represent nonlinear patterns.

Examples:

- Decision Trees
- Random Forests
- Kernel-based SVMs

If a simple linear model performs poorly, nonlinear candidate models may be evaluated.

However, model complexity should be justified through validation performance.

---

## Model Selection and Preprocessing

Model selection and preprocessing are connected.

Different models have different preprocessing requirements.

For example:

K-Nearest Neighbours:
Feature scaling is important because predictions depend on distances.

Support Vector Machines:
Scaling is often important.

Linear models:
Scaling can be important, especially with regularisation.

Decision Trees:
Generally less sensitive to feature scaling.

Random Forests:
Generally less sensitive to monotonic feature scaling.

Therefore, models should be compared together with appropriate preprocessing pipelines.

---

## Pipelines During Model Selection

Preprocessing and model training should ideally be evaluated as one pipeline.

Conceptually:

Raw Training Data
    ↓
Missing Value Handling
    ↓
Encoding
    ↓
Scaling if required
    ↓
Model
    ↓
Validation

This helps ensure preprocessing is learned only from the appropriate training portion during validation.

---

## Class Imbalance and Model Selection

For imbalanced classification problems, model selection should consider:

- Appropriate evaluation metrics
- Class weights where supported
- Decision thresholds
- Resampling strategies when justified
- Minority-class performance

A model with the highest accuracy may not be the best model.

For example, in fraud detection, detecting fraudulent transactions may be much more important than maximising overall accuracy.

---

## Computational Requirements

Models differ in their computational requirements.

Consider:

- Training time
- Prediction time
- Memory requirements
- Dataset size
- Number of features
- Hardware availability

A slightly less accurate model may sometimes be preferable if it is significantly faster or cheaper to operate and still satisfies the project requirements.

---

## Prediction Latency

Some applications require predictions very quickly.

Examples:

- Fraud detection
- Recommendation systems
- Real-time applications

Prediction speed should therefore be considered during model selection when real-time inference is required.

---

## Probability Estimates

Some applications require probabilities rather than only predicted classes.

For example:

Customer A:
80% probability of churn

Customer B:
52% probability of churn

If downstream decisions depend on calibrated probabilities, the model's probability outputs and calibration should be evaluated rather than considering only class labels.

---

## Reproducibility

Model-selection experiments should be reproducible.

Where applicable, record:

- Dataset version
- Train/test split strategy
- Random seeds
- Preprocessing steps
- Candidate models
- Hyperparameters
- Evaluation metrics
- Cross-validation strategy

This makes it easier to reproduce and compare experiments.

---

## Recommended Model Selection Workflow

A general workflow is:

Understand the Problem
    ↓
Identify ML Task
    ↓
Understand Dataset
    ↓
Choose Evaluation Metric
    ↓
Create Appropriate Data Split
    ↓
Create Baseline
    ↓
Select Candidate Models
    ↓
Build Appropriate Preprocessing Pipelines
    ↓
Cross-Validate Models
    ↓
Compare Results
    ↓
Tune Promising Models
    ↓
Select Final Model
    ↓
Evaluate on Held-Out Test Set

---

## BuildMyML Model Selection Principles

BuildMyML should not respond:

"Random Forest is the best model."

without considering the project and data.

Instead, model recommendations should consider:

### Problem Type

Is the task:

- Classification?
- Regression?
- Clustering?
- Another ML task?

### Dataset Characteristics

Consider:

- Number of rows
- Number of features
- Feature types
- Missing data
- Class imbalance
- Dimensionality

### User Requirements

Consider:

- Interpretability
- Training speed
- Prediction speed
- Computational resources
- Required performance

### Evaluation Strategy

Determine:

- Appropriate metrics
- Validation method
- Cross-validation strategy

### Candidate Models

Recommend several reasonable models rather than prematurely selecting one.

### Experimental Comparison

Models should ultimately be compared using data and validation results.

BuildMyML should therefore produce recommendations such as:

"Start with Logistic Regression as an interpretable baseline and compare it with Random Forest and another suitable nonlinear candidate using stratified cross-validation and metrics appropriate for the class distribution."

This is more defensible than claiming one algorithm is universally best.

---

## Common Model Selection Mistakes

Common mistakes include:

- Selecting an algorithm only because it is popular.
- Assuming one model is always best.
- Evaluating models only on training performance.
- Repeatedly tuning against the test set.
- Using inappropriate evaluation metrics.
- Ignoring class imbalance.
- Comparing models using different validation procedures.
- Performing preprocessing before splitting data.
- Ignoring model interpretability requirements.
- Ignoring computational constraints.
- Performing excessive hyperparameter tuning before establishing a baseline.
- Selecting the most complex model automatically.

---

## Sources

Primary references:

- Scikit-learn User Guide — Model Selection and Evaluation
- Scikit-learn User Guide — Cross-validation
- Scikit-learn User Guide — Tuning the Hyper-parameters of an Estimator
- Scikit-learn User Guide — Metrics and Scoring
- Scikit-learn User Guide — Pipelines and Composite Estimators
- Scikit-learn User Guide — Learning Curves
- Scikit-learn — Common Pitfalls and Recommended Practices
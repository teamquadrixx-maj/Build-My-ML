# Classification

## Overview

Classification is a supervised machine learning task where the objective is to predict a discrete class or category for an input.

A classification model learns from labelled training examples consisting of input features and known class labels. After training, the model predicts the class of previously unseen observations.

Typical classification problems include:

- Predicting whether a customer will churn.
- Detecting whether a transaction is fraudulent.
- Classifying an email as spam or not spam.
- Identifying the category of a disease.
- Predicting whether a loan applicant will default.

Classification should be considered when the target variable represents categories rather than a continuous numerical quantity.

## Types of Classification

### Binary Classification

Binary classification contains exactly two possible target classes.

Examples:

- Fraud / Not Fraud
- Churn / No Churn
- Spam / Not Spam
- Default / No Default
- Disease / No Disease

### Multiclass Classification

Multiclass classification contains more than two possible classes, with each observation normally belonging to one class.

Examples:

- Classifying an iris flower into one of several species.
- Classifying a document into one topic.
- Predicting one product category from several possible categories.

### Multilabel Classification

In multilabel classification, one observation can belong to multiple labels simultaneously.

For example, an image could simultaneously have labels such as:

- outdoor
- person
- vehicle

This differs from ordinary multiclass classification because multiple labels can be assigned to the same observation.

## Common Classification Algorithms

### Logistic Regression

Logistic Regression is a commonly used linear classification method. It is often useful as a baseline classification model and can produce class probability estimates.

It is especially useful when a relatively simple and interpretable decision boundary is appropriate.

### Decision Tree

Decision Trees make predictions using a hierarchy of feature-based decision rules.

They can model nonlinear relationships and are relatively easy to interpret, but unrestricted trees can overfit the training data.

### Random Forest

Random Forest is an ensemble of decision trees. Predictions from multiple randomized trees are combined to improve predictive performance and reduce some of the overfitting associated with an individual decision tree.

### Support Vector Machine

Support Vector Machines construct decision boundaries between classes. Kernel functions can also allow SVMs to model nonlinear boundaries.

Feature scaling is often important when using SVM-based models.

### K-Nearest Neighbours

K-Nearest Neighbours predicts a class using the labels of nearby training observations.

Its behaviour depends strongly on the distance measure, number of neighbours and feature scaling.

### Naive Bayes

Naive Bayes classifiers use Bayes' theorem with simplifying assumptions about the relationships between features.

Different variants are appropriate for different forms of data, including Gaussian, multinomial, Bernoulli and categorical features.

## When to Use Classification

Classification is appropriate when:

1. Historical labelled examples are available.
2. The target represents discrete categories.
3. The goal is to assign new observations to one or more classes.

If the required output is a continuous numerical quantity such as house price, temperature or sales amount, the problem is generally regression rather than classification.

If no target labels exist and the goal is to discover natural groups in the data, clustering may be more appropriate.

## Important Data Considerations

Before training a classifier, inspect:

- Missing values
- Categorical variables
- Numerical feature scales
- Duplicate observations
- Outliers
- Irrelevant features
- Class distribution
- Dataset size
- Data leakage
- Train/test separation

Any preprocessing learned from data should be fitted using training data rather than using information from the test set.

The same learned preprocessing transformations must then be applied consistently to validation, test and future production data.

## Class Imbalance

A classification dataset is imbalanced when some classes contain substantially more observations than others.

For example:

- 99% legitimate transactions
- 1% fraudulent transactions

In such situations, accuracy alone can be misleading.

A classifier predicting every transaction as legitimate would achieve 99% accuracy in this example while failing to detect any fraud.

For imbalanced classification problems, metrics such as precision, recall, F1-score and suitable precision-recall or ROC-based measures should be considered according to the problem.

The cost of false positives and false negatives should also influence model evaluation.

## Model Selection Considerations

There is no single classification algorithm that is best for every dataset.

Model choice can depend on:

- Number of observations
- Number and type of features
- Linear or nonlinear relationships
- Class imbalance
- Missing values
- Computational resources
- Interpretability requirements
- Prediction latency requirements
- Required probability estimates

Multiple suitable candidate models should normally be compared using appropriate validation procedures rather than selecting an algorithm only by assumption.

## Related Evaluation Metrics

### Accuracy

Accuracy measures the proportion of predictions that are correct.

It is easy to understand but may be inappropriate as the only metric for strongly imbalanced datasets.

### Precision

Precision measures how many observations predicted as positive are actually positive.

High precision is important when false-positive predictions are costly.

### Recall

Recall measures how many of the actual positive observations are correctly identified.

High recall is important when missing positive cases is costly.

### F1-Score

F1-score combines precision and recall using their harmonic mean.

It is useful when both false positives and false negatives matter.

### ROC-AUC

ROC-AUC evaluates how well prediction scores distinguish between classes across classification thresholds.

The appropriate evaluation metric should always depend on the real objective and consequences of prediction errors.

## Sources

Primary references:

- Scikit-learn User Guide — Supervised Learning
- Scikit-learn User Guide — Multiclass and Multioutput Algorithms
- Scikit-learn User Guide — Metrics and Scoring
- Scikit-learn — Common Pitfalls and Recommended Practices
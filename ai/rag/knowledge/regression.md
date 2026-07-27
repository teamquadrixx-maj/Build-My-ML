# Regression

## Overview

Regression is a supervised machine learning task used when the target variable is a continuous numerical value.

A regression model learns the relationship between input features and a numerical target from labelled training data. It can then estimate numerical values for new, unseen observations.

Typical regression problems include:

- Predicting house prices.
- Predicting monthly sales.
- Estimating product demand.
- Predicting temperature.
- Estimating delivery time.
- Predicting energy consumption.

Regression should generally be considered when the required output is a numerical quantity rather than a category.

## Types of Regression

### Simple Regression

Simple regression uses one input feature to predict a numerical target.

Example:

Using the size of a house to predict its price.

### Multiple Regression

Multiple regression uses two or more input features to predict a numerical target.

Example:

Predicting house price using:

- Area
- Number of bedrooms
- Location
- Age of the property
- Number of bathrooms

### Nonlinear Regression

Some datasets have relationships that cannot be represented adequately by a simple linear relationship.

Nonlinear models or transformations may be considered when the relationship between features and the target is more complex.

## Common Regression Algorithms

### Linear Regression

Linear Regression models the target as a linear combination of input features.

It is commonly used as a baseline because it is relatively simple, fast and interpretable.

### Ridge Regression

Ridge Regression is a regularised linear model.

It adds an L2 penalty that can reduce the influence of large coefficients and can help control overfitting.

### Lasso Regression

Lasso Regression uses L1 regularisation.

It can shrink some coefficients to zero, which can also make it useful when feature selection is desirable.

### Decision Tree Regressor

A Decision Tree Regressor predicts numerical values using a hierarchy of feature-based decision rules.

It can model nonlinear relationships but may overfit when the tree becomes too complex.

### Random Forest Regressor

Random Forest Regression combines predictions from multiple decision trees.

It can capture nonlinear relationships and interactions between features while generally being more robust than a single decision tree.

### Support Vector Regression

Support Vector Regression applies support vector machine principles to regression problems.

Its performance can depend strongly on feature scaling and the selected kernel and hyperparameters.

### K-Nearest Neighbours Regression

K-Nearest Neighbours Regression predicts a value using the target values of nearby training observations.

Feature scaling and the choice of the number of neighbours can strongly affect its performance.

## When to Use Regression

Regression is appropriate when:

1. Historical labelled data is available.
2. The target is numerical.
3. The objective is to estimate or predict a continuous quantity.

Examples include:

- Price prediction
- Demand forecasting
- Revenue estimation
- Temperature prediction
- Energy consumption prediction

If the target consists of categories such as fraud/not fraud or spam/not spam, classification is generally more appropriate.

If there is no labelled target and the goal is to discover groups in the data, clustering may be more appropriate.

## Important Data Considerations

Before training a regression model, inspect:

- Missing values
- Categorical features
- Numerical feature scales
- Outliers
- Duplicate observations
- Feature distributions
- Correlated features
- Data leakage
- Dataset size
- Train/test separation

Preprocessing operations learned from the data should be fitted using the training data and then applied consistently to validation and test data.

## Overfitting

Overfitting occurs when a model learns the training data too closely and does not generalise well to unseen data.

Possible signs include:

- Very good training performance.
- Significantly worse validation or test performance.

Methods that may help control overfitting include:

- Cross-validation
- Regularisation
- Limiting model complexity
- Appropriate feature selection
- Collecting additional representative training data

## Model Selection Considerations

There is no single regression algorithm that is best for every dataset.

Model selection can depend on:

- Dataset size
- Number of features
- Linear or nonlinear relationships
- Presence of outliers
- Interpretability requirements
- Computational resources
- Prediction latency
- Generalisation performance

Multiple suitable candidate models should be evaluated using appropriate validation methods.

## Evaluation Metrics

### Mean Absolute Error (MAE)

MAE measures the average absolute difference between predicted and actual values.

Lower MAE indicates smaller prediction errors.

### Mean Squared Error (MSE)

MSE measures the average squared difference between predicted and actual values.

Because errors are squared, larger errors receive a greater penalty.

### Root Mean Squared Error (RMSE)

RMSE is the square root of MSE.

It expresses prediction error in the same units as the target variable and gives relatively greater weight to large errors.

### R-squared (R²)

R² measures how much of the variation in the target is explained by the model relative to a baseline that predicts the target mean.

Higher values generally indicate a better fit, but R² should not be used alone to determine whether a model is suitable.

## Sources

Primary references:

- Scikit-learn User Guide — Linear Models
- Scikit-learn User Guide — Decision Trees
- Scikit-learn User Guide — Ensemble Methods
- Scikit-learn User Guide — Nearest Neighbours
- Scikit-learn User Guide — Support Vector Machines
- Scikit-learn User Guide — Model Evaluation
- Scikit-learn — Common Pitfalls and Recommended Practices
# Regression Model Selection

For predicting continuous numeric targets:

- Linear Regression: use when relationships are approximately linear and interpretability is required.
- Ridge/Lasso Regression: use when multicollinearity is present or when feature selection is needed (Lasso zeroes out weak features).
- Random Forest Regressor: good default for non-linear tabular data, robust to outliers.
- XGBoost/LightGBM Regressor: best for accuracy on structured data with complex interactions.
- Gradient Boosting: similar to XGBoost, good when the dataset is small-to-medium sized.

Rule of thumb: for business forecasting problems (revenue, demand, pricing) with tabular data, XGBoost or Random Forest regressors are strong defaults unless the stakeholder specifically needs a fully interpretable linear model.

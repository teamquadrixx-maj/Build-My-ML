# Time Series Preprocessing

For forecasting or time-dependent prediction problems:

- Never use random train/test splits — always split chronologically (train on past, test on future) to avoid data leakage.
- Create lag features (previous period's values) and rolling window statistics (moving average, rolling std).
- Handle seasonality explicitly: extract day-of-week, month, holiday flags as features, or use seasonal decomposition.
- Check for stationarity if using classical statistical models (ARIMA); tree-based/ML models are more tolerant of non-stationary data if given the right lag/trend features.
- Common models: XGBoost/LightGBM with engineered lag features, Prophet for business forecasting with strong seasonality, LSTM/Temporal models for large-scale sequential data.

Rule of thumb: for most business forecasting problems (demand, revenue, churn-over-time), a gradient boosting model with well-engineered lag and seasonal features outperforms complex deep learning approaches unless data volume is very large.

# Preprocessing for Tabular Data

Standard preprocessing steps for structured/tabular ML projects:

1. Handle missing values: impute with median/mode for numeric/categorical, or use model-based imputation for critical fields. Flag missingness as a feature if it's informative.
2. Encode categorical variables: one-hot encoding for low-cardinality categories, target/frequency encoding for high-cardinality categories (e.g. zip codes, product IDs).
3. Scale numeric features: standardization (z-score) for linear models and neural networks; tree-based models (Random Forest, XGBoost) do not require scaling.
4. Handle outliers: cap/winsorize extreme values or use robust scalers if outliers are not data errors.
5. Feature engineering: derive domain-relevant features (e.g. tenure, recency, frequency, monetary value) rather than relying purely on raw fields.
6. Train/test split: use stratified splits for classification to preserve class distribution; use time-based splits for time-series data to avoid leakage.

Rule of thumb: tree-based models need minimal scaling but still benefit from good feature engineering and missing-value handling.

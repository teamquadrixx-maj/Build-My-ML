# Data Preprocessing

## Overview

Data preprocessing is the process of preparing raw data before it is used to train a machine learning model.

Real-world datasets often contain missing values, categorical variables, inconsistent formats, features with different numerical scales, duplicate records, outliers, and irrelevant information.

Good preprocessing helps transform raw data into a form that machine learning algorithms can use effectively.

Typical preprocessing tasks include:

- Handling missing values
- Removing duplicate records
- Encoding categorical variables
- Scaling numerical features
- Handling outliers
- Transforming features
- Feature selection
- Preventing data leakage
- Splitting data correctly
- Building reproducible preprocessing pipelines

The correct preprocessing strategy depends on the dataset, machine learning task, and model being used.

---

## Understanding the Dataset

Before applying transformations, the dataset should first be inspected.

Important characteristics include:

- Number of observations
- Number of features
- Feature names
- Data types
- Missing values
- Duplicate observations
- Numerical features
- Categorical features
- Target variable
- Class distribution for classification
- Feature distributions
- Possible outliers

Understanding the dataset before preprocessing helps avoid applying unnecessary or inappropriate transformations.

---

## Missing Values

Real-world datasets frequently contain missing information.

For example:

| Age | Income | City |
| --- | --- | --- |
| 25 | 45000 | Bengaluru |
| 31 | Missing | Mysuru |
| Missing | 62000 | Bengaluru |

Many machine learning algorithms cannot directly work with missing values, so they must be handled appropriately.

### Removing Missing Data

Rows or columns containing missing values may sometimes be removed.

This can be appropriate when:

- Only a very small proportion of observations are missing.
- A feature contains very little useful information.
- Removing the data does not introduce significant bias.

However, removing too much data can reduce the amount of useful training information.

### Imputation

Imputation replaces missing values with estimated values.

For numerical features, common simple strategies include:

- Mean
- Median
- Constant value

Median imputation can be more robust than mean imputation when numerical data contains extreme values.

For categorical features, common approaches include:

- Most frequent category
- A separate category such as "Unknown"

More advanced imputation methods may also be considered depending on the dataset and problem.

The imputation strategy should be learned from the training data and then applied to validation, test, and future data.

---

## Duplicate Records

Datasets may contain duplicate observations.

Duplicates can occur because of:

- Repeated data collection
- Data merging
- Import errors
- System errors

Duplicates should be investigated before automatically removing them.

Some duplicates may be legitimate observations.

Others may artificially influence model training.

The decision to remove duplicates should therefore depend on what each observation represents.

---

## Categorical Features

Categorical features contain categories rather than continuous numerical measurements.

Examples include:

- City
- Product type
- Education level
- Payment method
- Customer category

Many machine learning algorithms require these categories to be represented numerically.

---

## One-Hot Encoding

One-hot encoding creates separate binary features for categories.

For example:

City:

- Bengaluru
- Mysuru
- Mangaluru

can become:

| City_Bengaluru | City_Mysuru | City_Mangaluru |
| --- | --- | --- |
| 1 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 0 | 1 |

One-hot encoding is commonly useful for nominal categorical features where the categories do not have a meaningful order.

A potential disadvantage is that features with many unique categories can create a large number of additional columns.

---

## Ordinal Encoding

Ordinal encoding represents categories using ordered numerical values.

For example:

Education level:

Low → 0

Medium → 1

High → 2

This can be appropriate when categories have a genuine meaningful order.

It should not be used merely to assign arbitrary numerical relationships to unordered categories.

For example, assigning:

Red → 1

Blue → 2

Green → 3

could incorrectly imply an ordering between colours.

---

## Feature Scaling

Numerical features can have very different ranges.

Example:

Age:

18–80

Annual income:

20000–200000

Some machine learning algorithms are sensitive to these differences in scale.

Feature scaling transforms numerical features into more comparable ranges.

---

## Standardisation

Standardisation transforms a feature using its mean and standard deviation.

After standardisation, the transformed training feature is typically centred around zero with unit variance.

Standardisation is commonly considered for algorithms that depend on distances, margins, or optimisation behaviour.

Examples include:

- Support Vector Machines
- K-Nearest Neighbours
- Logistic Regression in many settings
- Regularised linear models
- Principal Component Analysis

---

## Min-Max Scaling

Min-max scaling transforms values into a specified range, commonly between 0 and 1.

It can be useful when bounded feature values are desirable.

However, min-max scaling can be sensitive to extreme values because the minimum and maximum directly determine the transformation.

---

## Robust Scaling

Robust scaling uses statistics that are less influenced by extreme observations, such as the median and interquartile range.

It can therefore be useful when numerical features contain substantial outliers.

---

## Do All Models Need Feature Scaling?

No.

Scaling requirements depend on the algorithm.

Distance-based algorithms such as K-Nearest Neighbours are strongly affected by feature scale.

Support Vector Machines and many linear models can also benefit from appropriate scaling.

Tree-based models such as:

- Decision Trees
- Random Forests
- Many tree-based boosting methods

are generally much less sensitive to monotonic feature scaling.

Therefore, BuildMyML should not automatically recommend scaling for every machine learning project.

The recommendation should depend on the selected model and dataset.

---

## Outliers

Outliers are observations that differ substantially from most other observations.

For example:

Most salaries:

30000–100000

One observation:

5000000

Outliers can arise from:

- Genuine rare observations
- Measurement errors
- Data-entry errors
- System failures
- Unusual but valid events

Outliers should not automatically be removed.

They should first be investigated.

---

## Handling Outliers

Possible approaches include:

- Correcting obvious data errors
- Removing invalid observations
- Applying transformations
- Using robust scaling
- Using models less sensitive to extreme values
- Keeping valid extreme observations when they represent real cases

The appropriate strategy depends on the meaning of the data and the machine learning objective.

---

## Feature Transformation

Some numerical variables have highly skewed distributions.

Depending on the problem and model, transformations may sometimes make these features easier to model.

Possible transformations include:

- Logarithmic transformations
- Power transformations
- Quantile transformations

Transformations should only be applied when they are appropriate for the feature and model.

---

## Feature Engineering

Feature engineering creates useful features from existing data.

For example, if a dataset contains:

Date of Birth

a new feature could be:

Age

If a dataset contains:

Total Purchase Amount
Number of Purchases

a new feature could be:

Average Purchase Value

Good feature engineering uses domain knowledge to create information that may help the model learn useful patterns.

---

## Feature Selection

Not every available feature is necessarily useful.

Irrelevant, redundant, or noisy features can:

- Increase model complexity
- Increase training time
- Make interpretation harder
- Sometimes reduce generalisation performance

Feature selection attempts to retain useful features while removing unnecessary ones.

Possible approaches include:

- Domain knowledge
- Statistical methods
- Model-based feature importance
- Regularisation
- Recursive feature elimination

Feature selection should be performed carefully within the training process to avoid leaking information from validation or test data.

---

## Data Leakage

Data leakage occurs when information that would not legitimately be available when making future predictions influences model training.

This can produce unrealistically strong evaluation results.

Data leakage is one of the most important problems to avoid in machine learning.

### Example

Suppose the goal is to predict whether a customer will default on a loan.

A feature containing information recorded only after the default occurred should not be used to predict the default.

The model would effectively be receiving information from the future.

---

## Preprocessing Leakage

Leakage can also happen during preprocessing.

For example, suppose StandardScaler is fitted using the entire dataset before train/test splitting.

Information from the test data has influenced the calculated mean and standard deviation.

Instead, the correct conceptual process is:

Training data
    ↓
Fit preprocessing
    ↓
Transform training data

Then:

Validation/Test data
    ↓
Use the SAME fitted preprocessing
    ↓
Transform validation/test data

The validation or test set should not be used to learn preprocessing parameters.

---

## Train, Validation, and Test Data

Machine learning data is commonly separated into different subsets.

### Training Set

Used to train the model and learn model parameters.

### Validation Set

Used during model development for activities such as:

- Comparing candidate models
- Selecting hyperparameters
- Selecting preprocessing strategies

Cross-validation may also be used instead of a single validation split.

### Test Set

Used for final evaluation after model development decisions have been made.

The test set should represent unseen data and should not influence model selection or preprocessing decisions.

---

## Preprocessing Pipelines

A preprocessing pipeline combines multiple transformations into a repeatable workflow.

For example:

Raw Data
    ↓
Missing Value Imputation
    ↓
Categorical Encoding
    ↓
Feature Scaling
    ↓
Machine Learning Model

Pipelines help ensure that the same transformations are consistently applied during:

- Training
- Validation
- Testing
- Future inference

They can also reduce the risk of data leakage when used correctly.

---

## Different Preprocessing for Different Columns

A dataset can contain multiple types of features.

Example:

Numerical:

- Age
- Income
- Account balance

Categorical:

- City
- Employment type
- Education

Different transformations may be required.

For example:

Numerical columns:

Missing value imputation
    ↓
Scaling

Categorical columns:

Missing value imputation
    ↓
One-hot encoding

Column-specific preprocessing can be combined into a unified machine learning pipeline.

---

## Preprocessing for Classification

A classification preprocessing workflow may include:

1. Inspect the dataset.
2. Identify the target variable.
3. Separate features and target.
4. Split the data appropriately.
5. Handle missing values.
6. Encode categorical features.
7. Scale numerical features when required by the selected model.
8. Investigate class imbalance.
9. Train the classifier.
10. Evaluate using appropriate classification metrics.

The exact sequence may vary depending on the dataset and model.

---

## Preprocessing for Regression

A regression preprocessing workflow may include:

1. Inspect the dataset.
2. Identify the numerical target.
3. Separate features and target.
4. Split the data appropriately.
5. Handle missing values.
6. Encode categorical features.
7. Investigate numerical distributions and outliers.
8. Scale features when required.
9. Train candidate regression models.
10. Evaluate using appropriate regression metrics.

---

## Preprocessing for Clustering

Clustering has no labelled target in the typical case.

A preprocessing workflow may include:

1. Inspect the dataset.
2. Select meaningful clustering features.
3. Handle missing values.
4. Encode appropriate categorical information.
5. Scale numerical features when required.
6. Investigate outliers.
7. Consider dimensionality reduction if appropriate.
8. Apply clustering.
9. Evaluate cluster quality.
10. Interpret clusters using domain knowledge.

Feature selection and scaling can be especially important because many clustering algorithms rely on distances between observations.

---

## Class Imbalance

Classification datasets can contain highly unequal numbers of examples from different classes.

Example:

Normal transactions: 99%

Fraudulent transactions: 1%

In such cases, model development may require special attention.

Possible approaches can include:

- Appropriate evaluation metrics
- Class weighting where supported
- Resampling methods where justified
- Threshold analysis
- Collecting additional minority-class data

Accuracy alone may be misleading for strongly imbalanced classification problems.

Preprocessing choices for imbalanced datasets should be evaluated carefully and performed without leaking information across training and evaluation boundaries.

---

## High-Cardinality Categorical Features

Some categorical features contain many unique categories.

Examples include:

- Product IDs
- Postal codes
- User IDs
- Device identifiers

Applying ordinary one-hot encoding can produce a very large feature space.

Possible strategies depend on the meaning of the feature and can include:

- Removing identifiers that contain no predictive information
- Grouping rare categories
- Using alternative encodings when justified
- Using models that can appropriately handle categorical information

Care must be taken because some encoding techniques can introduce target leakage if they use target information incorrectly.

---

## Time-Based Data

Datasets involving time require additional care.

Random train/test splitting may be inappropriate when the objective is to predict future observations.

For example:

Training data:

January–October

Test data:

November–December

may better represent a future prediction scenario than randomly mixing observations from all months.

Preprocessing parameters should still be learned only from the training period.

---

## Common Preprocessing Mistakes

Common mistakes include:

- Fitting preprocessing using the entire dataset.
- Allowing test data to influence model development.
- Scaling every feature without considering the model.
- Encoding unordered categories as if they had an order.
- Removing every outlier automatically.
- Dropping every row containing a missing value.
- Performing feature selection using the complete dataset before splitting.
- Applying different preprocessing during training and prediction.
- Ignoring class imbalance.
- Including identifiers that provide no meaningful predictive information.
- Creating features using information unavailable at prediction time.
- Preprocessing training and test data inconsistently.

---

## Recommended General Workflow

A safe conceptual workflow is:

Raw Dataset
    ↓
Understand Data
    ↓
Identify Features and Target
    ↓
Create Appropriate Data Split
    ↓
Fit Preprocessing on Training Data
    ↓
Transform Training Data
    ↓
Train Model
    ↓
Apply Same Preprocessing to Validation/Test Data
    ↓
Evaluate Model
    ↓
Apply Same Pipeline to Future Data

The exact preprocessing steps should be selected based on the dataset and model rather than applying every available transformation automatically.

---

## BuildMyML Preprocessing Recommendation Principles

When BuildMyML recommends preprocessing, it should consider:

### Missing Values

Are missing values present?

If yes, determine appropriate handling based on feature type and missingness.

### Categorical Features

Are categorical variables present?

If yes, determine an appropriate encoding strategy.

### Numerical Features

Do numerical features have very different scales?

If yes, determine whether the selected model is scale-sensitive.

### Outliers

Are extreme values present?

If yes, determine whether they are valid observations or errors before recommending removal or transformation.

### Class Imbalance

For classification, examine whether the target distribution is strongly imbalanced.

### Data Leakage

Check whether any feature or preprocessing operation could expose information unavailable at prediction time.

### Model Requirements

Preprocessing recommendations should be compatible with the selected machine learning algorithm.

BuildMyML should therefore generate preprocessing recommendations based on the characteristics of the user's dataset and selected modelling approach rather than applying a fixed preprocessing template to every project.

---

## Sources

Primary references:

- Scikit-learn User Guide — Preprocessing Data
- Scikit-learn User Guide — Imputation of Missing Values
- Scikit-learn User Guide — Encoding Categorical Features
- Scikit-learn User Guide — Pipelines and Composite Estimators
- Scikit-learn User Guide — Feature Selection
- Scikit-learn User Guide — Cross-validation
- Scikit-learn — Common Pitfalls and Recommended Practices
# Clustering

## Overview

Clustering is an unsupervised machine learning technique used to group similar data points together.

Unlike classification and regression, clustering usually works without labelled target values. The algorithm attempts to discover patterns or natural groups within the data based on similarities between observations.

Typical clustering applications include:

- Customer segmentation
- Grouping similar products
- Document grouping
- User behaviour analysis
- Image segmentation
- Discovering patterns in unlabeled datasets
- Grouping geographical regions based on characteristics

Clustering is useful when the objective is to explore the structure of data rather than predict a known target variable.

## How Clustering Works

A clustering algorithm analyses the features of observations and attempts to place similar observations into the same group.

For example, a customer dataset may contain:

- Age
- Income
- Purchase frequency
- Average spending
- Website activity

A clustering algorithm could identify groups such as:

- Frequent high-spending customers
- Occasional customers
- Low-engagement customers

These groups are discovered from patterns in the features rather than from predefined customer labels.

## Common Clustering Algorithms

### K-Means Clustering

K-Means is a widely used clustering algorithm that divides observations into a predefined number of clusters.

The algorithm attempts to minimise the distance between observations and the centre of their assigned cluster.

The general process is:

1. Select the number of clusters, K.
2. Initialise cluster centres.
3. Assign each observation to its nearest cluster centre.
4. Recalculate the cluster centres.
5. Repeat assignment and centre updates until convergence.

K-Means can work well when clusters are relatively compact and separated.

Important considerations include:

- The number of clusters must normally be specified.
- Feature scaling can strongly affect the results.
- K-Means can be sensitive to outliers.
- Different initialisations can produce different results.
- It may perform poorly when clusters have highly irregular shapes or substantially different densities.

### Hierarchical Clustering

Hierarchical clustering creates a hierarchy of clusters.

A common approach is agglomerative clustering, which begins with individual observations and repeatedly merges similar groups.

The resulting hierarchy can be visualised using a dendrogram.

Hierarchical clustering can be useful when:

- The number of clusters is not initially obvious.
- The relationship between clusters is important.
- The dataset is small or moderately sized.

The choice of distance metric and linkage method can significantly affect the resulting clusters.

### DBSCAN

DBSCAN stands for Density-Based Spatial Clustering of Applications with Noise.

It groups observations based on areas of high data density.

Unlike K-Means, DBSCAN does not require the number of clusters to be specified directly.

It can:

- Discover clusters with irregular shapes.
- Identify observations that do not belong to a dense cluster as noise.
- Handle some datasets where K-Means performs poorly.

Important DBSCAN parameters include:

- `eps` — the neighbourhood distance used when determining nearby observations.
- `min_samples` — the minimum number of observations required to form a dense region.

DBSCAN performance can depend strongly on these parameter values and on feature scaling.

### Mean Shift

Mean Shift is a clustering algorithm that attempts to identify dense regions in the feature space.

It does not require the number of clusters to be specified beforehand.

However, it can be computationally expensive for larger datasets.

### Gaussian Mixture Models

Gaussian Mixture Models represent data as a mixture of probability distributions.

Unlike methods that perform only hard cluster assignment, a Gaussian Mixture Model can provide probabilities indicating how likely an observation is to belong to each component.

This can be useful when cluster boundaries are not clearly separated.

## When to Use Clustering

Clustering may be appropriate when:

1. The dataset does not contain a labelled target variable.
2. The objective is to discover natural groups or patterns.
3. Similar observations should be grouped together.
4. Exploratory analysis of the dataset is required.

Examples include:

### Customer Segmentation

Customers can be grouped based on:

- Purchasing behaviour
- Income
- Frequency of purchases
- Product preferences
- Engagement

### Document Grouping

Documents can be grouped based on similarity in their content or representations.

### Product Segmentation

Products can be grouped according to attributes, purchasing patterns or user behaviour.

### Anomaly Exploration

Some clustering techniques can help identify observations that do not belong naturally to major groups.

However, dedicated anomaly-detection methods may be more appropriate when anomaly detection itself is the primary objective.

## Classification vs Clustering

Classification and clustering should not be confused.

### Classification

Classification is supervised.

Training data contains known labels.

Example:

Input:

Customer information

Target:

Churn / No Churn

The model learns to predict an existing target class.

### Clustering

Clustering is unsupervised.

There may be no predefined target labels.

Example:

Input:

Customer information

Output:

Automatically discovered customer groups.

Therefore:

Known categorical target → Classification

No target and need to discover groups → Clustering

## Important Data Considerations

Before performing clustering, inspect the dataset for:

- Missing values
- Numerical and categorical features
- Feature scales
- Outliers
- Duplicate observations
- Irrelevant features
- Highly correlated or redundant features
- High dimensionality

The selected features are especially important because clustering is based on similarity between observations.

Poor or irrelevant features can produce clusters that are mathematically separated but not useful for the actual problem.

## Feature Scaling

Feature scaling is particularly important for many distance-based clustering algorithms.

Consider two features:

- Age: approximately 18–80
- Annual income: approximately 20,000–200,000

Without scaling, the income feature may dominate a distance calculation simply because its numerical values are much larger.

Common scaling approaches include:

- Standardisation
- Min-max scaling
- Robust scaling

The appropriate preprocessing depends on the dataset and clustering algorithm.

## Distance and Similarity

Many clustering algorithms depend on a measure of similarity or distance between observations.

A common choice for numerical data is Euclidean distance.

However, the appropriate similarity measure depends on:

- Feature types
- Data distribution
- Problem domain
- Selected clustering algorithm

The distance metric should therefore be selected carefully rather than automatically using the same metric for every dataset.

## Choosing the Number of Clusters

Some algorithms, particularly K-Means, require the number of clusters to be specified.

Several approaches can help investigate a suitable number of clusters.

### Elbow Method

The Elbow Method evaluates how within-cluster variation changes as the number of clusters increases.

The goal is to look for a point where adding additional clusters provides diminishing improvement.

The elbow method is a heuristic and does not always produce an obvious answer.

### Silhouette Analysis

The Silhouette Coefficient measures how well observations fit within their assigned clusters compared with neighbouring clusters.

Values closer to 1 generally indicate that observations are well matched to their own cluster and separated from neighbouring clusters.

Values near 0 can indicate overlapping clusters.

Negative values can indicate that observations may have been assigned to inappropriate clusters.

## Evaluating Clustering

Evaluating clustering can be more difficult than evaluating supervised learning because true labels may not exist.

Possible evaluation methods include:

### Silhouette Score

Measures how similar an observation is to its own cluster compared with other clusters.

Higher values generally indicate better-defined clusters.

### Calinski-Harabasz Score

Measures the relationship between between-cluster dispersion and within-cluster dispersion.

Higher values generally indicate clusters that are more separated and compact.

### Davies-Bouldin Score

Evaluates similarity between clusters using within-cluster scatter and separation between clusters.

Lower values generally indicate better separation.

Evaluation metrics should not be considered alone.

The usefulness and interpretability of the resulting clusters within the actual application should also be examined.

## Outliers and Noise

Outliers can significantly affect some clustering algorithms.

For example, K-Means cluster centres can be influenced by extreme observations.

Possible approaches include:

- Investigating extreme observations before clustering.
- Using robust preprocessing where appropriate.
- Selecting algorithms that explicitly handle noise.

DBSCAN, for example, can label observations in low-density regions as noise instead of forcing every observation into a cluster.

## High-Dimensional Data

Clustering becomes more challenging when datasets contain many features.

In high-dimensional spaces, distance measurements may become less informative.

Possible approaches include:

- Feature selection
- Removing irrelevant features
- Dimensionality reduction
- Domain-based feature engineering

Techniques such as Principal Component Analysis (PCA) may sometimes be used before clustering, depending on the problem.

## Model Selection Considerations

There is no single clustering algorithm that is best for every dataset.

The choice depends on factors such as:

- Dataset size
- Number of features
- Expected cluster shapes
- Presence of noise
- Presence of outliers
- Cluster density
- Whether the number of clusters is known
- Computational requirements
- Interpretability requirements

For example:

K-Means may be suitable for relatively compact clusters when the number of clusters can be estimated.

DBSCAN may be useful when clusters have irregular shapes and noise should be identified.

Hierarchical clustering may be useful when understanding relationships between clusters is important.

Multiple approaches should be evaluated when the structure of the data is unknown.

## Common Clustering Mistakes

Common mistakes include:

- Using clustering when a labelled prediction target already exists.
- Forgetting to scale features for distance-sensitive algorithms.
- Selecting K arbitrarily without evaluating alternatives.
- Assuming every dataset naturally contains meaningful clusters.
- Including irrelevant features.
- Ignoring outliers.
- Treating automatically discovered clusters as real-world categories without validation.
- Evaluating clusters using only one numerical metric.
- Interpreting correlation or similarity as causation.

Clustering results should be interpreted together with domain knowledge and exploratory data analysis.

## Sources

Primary references:

- Scikit-learn User Guide — Clustering
- Scikit-learn User Guide — K-Means
- Scikit-learn User Guide — Hierarchical Clustering
- Scikit-learn User Guide — DBSCAN
- Scikit-learn User Guide — Gaussian Mixture Models
- Scikit-learn User Guide — Clustering Performance Evaluation
- Scikit-learn User Guide — Preprocessing Data
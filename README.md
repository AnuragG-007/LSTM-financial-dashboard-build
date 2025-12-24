
# 📈 Financial Time Series Forecasting using Bi-LSTM

> **End-to-end sequence modeling system for financial time series using Bidirectional LSTM and a production-ready inference backend**

This project implements a **complete financial time-series forecasting pipeline**, focusing on correct sequence modeling, feature engineering, and real-world inference deployment.

The goal of the project is **not trading or profit prediction**, but to study how deep sequence models behave on **noisy, non-stationary financial data** and how such models can be deployed as reliable backend services.

---

## 🚀 Project Overview

Given a rolling window of **historical market data**, the system predicts the **short-term future behavior** of financial instruments using a **Bidirectional LSTM (Bi-LSTM)** model.

The project covers the full ML lifecycle:
- Data collection & preprocessing
- Feature engineering
- Sequence modeling with Bi-LSTM
- Evaluation on unseen temporal splits
- Deployment via FastAPI for real-time inference

---

## 🧠 Modeling Approach

### Why Sequence Models?
Financial data is sequential, noisy, and temporally dependent. Classical regression models fail to capture long-term dependencies and non-linear temporal patterns.

### Why Bi-LSTM?
- LSTM networks model long-range temporal dependencies
- Bidirectional LSTM improves temporal feature extraction during training by learning from both past and future context within fixed windows

> Note: Bidirectionality is used during training only. Inference relies strictly on past data.

---

## 🧩 Data Collection & Feature Engineering

### Data Sources
- Historical OHLC market data fetched programmatically
- External APIs used to ensure reliable data access in deployment environments

### Feature Engineering
- Sliding-window sequence generation
- Normalization for stable training
- Temporal train/validation/test splits to prevent data leakage

The dataset includes assets with diverse behaviors:
- Trending equities
- Stable large-cap stocks
- Highly volatile instruments (e.g., cryptocurrencies)

---

## 🧠 Sequence Modeling Pipeline

```
Market Data
   ↓
Feature Engineering & Scaling
   ↓
Sliding Window Generation
   ↓
Bi-LSTM Training
   ↓
Model Evaluation
   ↓
Saved Model Artifact
   ↓
FastAPI Inference Service
   ↓
JSON Forecasts
```

---

## 📊 Evaluation Strategy

Model evaluation focuses on **temporal consistency and generalization**, not just raw accuracy.

### Metrics Used
- Mean Squared Error (MSE)
- Mean Absolute Error (MAE)
- Directional accuracy

### Baseline Comparison
- Naive moving-average predictors

The Bi-LSTM demonstrates improved performance over baselines in stable regimes, with expected degradation during high-volatility periods.

---

## ⚙️ Backend & Inference

The trained model is served using a **FastAPI backend**, enabling:

- Real-time forecasting via REST APIs
- Clean JSON-based responses
- Easy integration with dashboards or downstream services

The system cleanly separates **training logic** from **inference logic**, reflecting production best practices.

---

## 🛠️ Tech Stack

### Machine Learning
- Python
- TensorFlow / Keras
- Bidirectional LSTM
- Scikit-learn

### Backend & Deployment
- FastAPI
- Uvicorn
- RESTful APIs

### Data & Visualization
- Pandas
- NumPy
- Matplotlib

---

## ⚠️ Limitations

- Financial time series are highly non-stationary
- Model captures patterns, not causal mechanisms
- Performance degrades under extreme volatility
- Forecasts should be treated as analytical signals, not decisions

---

## ⚠️ Disclaimer

This project is for **educational and research purposes only**.  
It does not constitute financial or trading advice.

---

⭐ If you find this project useful, consider starring the repository!

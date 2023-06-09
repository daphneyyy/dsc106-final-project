import numpy as np
import pandas as pd

data = pd.read_csv('data/salaries.csv')

def category(x):
    x = x.lower()
    if 'ana' in x:
        return 'Analyst'
    elif 'eng' in x:
        return 'Engineer'
    elif 'arch' in x:
        return 'Architect'
    elif 'sci' in x:
        return 'Scientist'
    elif 'developer' in x:
        return 'Developer'
    else:
        return 'Others'
    
def sub_category(x):
    x = x.lower()
    if 'machine learning' in x or 'ml' in x:
        return 'Machine Learning'
    elif 'deep learning' in x or 'dl' in x:
        return 'Deep Learning'
    elif 'business intelligence' in x or 'bi' in x:
        return 'Business Intelligence'
    elif 'big data' in x or 'bd' in x:
        return 'Big Data'
    elif 'cloud' in x or 'aws' in x or 'azure' in x or 'gcp' in x:
        return 'Cloud'
    elif 'finan' in x or 'business' in x:
        return 'Business'
    else:
        return 'Others'

data['category'] = data['job_title'].apply(category)
data['sub_category'] = data['job_title'].apply(sub_category)

def assign_full_category(row):
    if row['sub_category'] != 'Others' and row['category'] != 'Others':
        return row['sub_category'] + ' Data ' + row['category']
    elif row['category'] != 'Others':
        return 'General Data ' + row['category']
    else:
        return 'Others'

data['full_category'] = data.apply(assign_full_category, axis=1)

data_by_categories = data[data['work_year'] == 2023][['category', 'full_category', 'salary_in_usd']]

data_by_categories.to_csv('data/data_by_categories.csv', index=False)
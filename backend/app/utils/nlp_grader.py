import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import numpy as np
import random

# Download NLTK data if not already present
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def preprocess_text(text):
    """Cleans and tokenizes text, removes stop words, and lemmatizes."""
    if not text:
        return ""
    # Remove HTML tags
    clean_text = re.sub(r'<[^>]+>', '', text)
    # Remove special characters and numbers, convert to lowercase
    clean_text = re.sub(r'[^a-zA-Z\s]', '', clean_text).lower()
    tokens = clean_text.split()
    # Remove stop words and lemmatize
    lemmatized_tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return " ".join(lemmatized_tokens)

def calculate_essay_score(student_answer_raw, model_answer_raw, keywords_list, max_mark, word_limit=None):
    """
    Evaluates a student's essay answer against a model answer and keywords using NLP.
    Returns a score, matched/missing keywords, and mock NLP insights.
    """
    student_answer = preprocess_text(student_answer_raw)
    model_answer = preprocess_text(model_answer_raw)

    # Handle keywords as list of objects or strings
    keywords = [
        kw.get('text', kw) if isinstance(kw, dict) else kw
        for kw in keywords_list
    ] if keywords_list else []

    # Cosine Similarity for overall content match
    documents = [student_answer, model_answer]
    if not student_answer or not model_answer:
        cosine_sim = 0.0
    else:
        vectorizer = TfidfVectorizer()
        try:
            tfidf_matrix = vectorizer.fit_transform(documents)
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except ValueError:
            cosine_sim = 0.0

    # Keyword matching
    student_keywords_found = []
    missing_keywords = []
    student_tokens = set(student_answer.split())
    
    for keyword in keywords:
        preprocessed_keyword = preprocess_text(keyword)
        if preprocessed_keyword and preprocessed_keyword in student_tokens:
            student_keywords_found.append(keyword)
        else:
            missing_keywords.append(keyword)

    # Score calculation logic
    score_from_similarity = cosine_sim * (max_mark * 0.7)
    keyword_bonus_per_keyword = (max_mark * 0.3) / len(keywords_list) if keywords_list else 0
    score_from_keywords = len(student_keywords_found) * keyword_bonus_per_keyword
    total_score = min(max_mark, score_from_similarity + score_from_keywords)

    if word_limit is not None and word_limit > 0:
        student_word_count = len(re.sub(r'<[^>]+>', '', student_answer_raw).split())
        if student_word_count > word_limit:
            total_score *= 0.9
            total_score = max(0, total_score)

    sentiment = "neutral"
    if total_score > max_mark * 0.8:
        sentiment = "positive"
    elif total_score < max_mark * 0.4:
        sentiment = "negative"

    readability_score = random.randint(50, 90)

    return {
        'score': round(total_score, 2),
        'cosineSimilarity': round(cosine_sim, 2),
        'nlpInsights': {
            'matchedKeywords': student_keywords_found,
            'missingKeywords': missing_keywords,
            'sentiment': sentiment,
            'readabilityScore': readability_score,
            'overallMatchPercentage': round(cosine_sim * 100, 2)
        }
    }
    
if __name__ == '__main__':
    # Example Usage
    student_ans = "<p>Normalization is a database design technique used to organize tables in a manner that reduces data redundancy and improves data integrity. It involves breaking down a large table into smaller, less redundant tables and defining relationships between them. The primary goals are to eliminate redundant data, ensure data dependencies make sense, and protect data integrity.</p><p>There are several normal forms (1NF, 2NF, 3NF, BCNF, 4NF, 5NF), each with specific rules. For example, 1NF requires atomic values, 2NF requires non-key attributes to be fully dependent on the primary key, and 3NF eliminates transitive dependencies.</p>"
    model_ans = "<p>Normalization is a systematic approach to organizing data in a database to reduce data redundancy and improve data integrity. It involves decomposing tables into smaller, well-structured tables and establishing relationships between them. The process aims to eliminate undesirable characteristics like insertion, update, and deletion anomalies.</p><p>Key normal forms include:</p><ul><li><strong>First Normal Form (1NF):</strong> Eliminates repeating groups and ensures atomic values.</li><li><strong>Second Normal Form (2NF):</strong> Requires all non-key attributes to be fully functionally dependent on the primary key.</li><li><strong>Third Normal Form (3NF):</strong> Removes transitive dependencies, meaning non-key attributes should not depend on other non-key attributes.</li><li><strong>Boyce-Codd Normal Form (BCNF):</strong> A stricter version of 3NF, addressing certain anomalies not covered by 3NF.</li></ul><p>The benefits include reduced data duplication, improved data consistency, faster data retrieval, and easier maintenance.</p>"
    keywords = ['normalization', 'data redundancy', 'data integrity', 'normal forms', '1NF', '2NF', '3NF', 'BCNF', 'atomic values', 'functional dependency', 'transitive dependency']
    max_mark = 10
    word_limit = 200

    result = calculate_essay_score(student_ans, model_ans, keywords, max_mark, word_limit)
    print("Essay Grading Result:", result)

    student_ans_short = "<p>Normalization helps organize data.</p>"
    result_short = calculate_essay_score(student_ans_short, model_ans, keywords, max_mark)
    print("Short Essay Grading Result:", result_short)

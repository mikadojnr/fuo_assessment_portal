import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import random  # For mock data
import json

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
    clean_text = re.sub(r'<[^>]+>', '', text)
    clean_text = re.sub(r'[^a-zA-Z\s]', '', clean_text).lower()
    tokens = clean_text.split()
    lemmatized_tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return " ".join(lemmatized_tokens)

def check_plagiarism(current_submission_id, student_answer_raw, all_submissions_for_assessment):
    """
    Checks for plagiarism by comparing a student's answer against other submissions
    for the same assessment using Cosine Similarity.
    """
    current_student_preprocessed = preprocess_text(student_answer_raw)
    
    if not current_student_preprocessed:
        return {
            'similarityScore': 0,
            'matchedSources': [],
            'cosineSimilarity': 0.0,
            'nlpInsights': {
                'missingKeywords': [],
                'extraKeywords': [],
                'sentiment': 'neutral',
                'readabilityScore': random.randint(50, 90)
            }
        }

    highest_similarity = 0.0
    matched_sources = []
    documents = [current_student_preprocessed]
    other_submission_map = {}

    for sub in all_submissions_for_assessment:
        if sub.id != current_submission_id and sub.answers_json:
            try:
                other_answers = json.loads(sub.answers_json)
                for ans_idx, other_ans in enumerate(other_answers):
                    if other_ans.get('type') == 'essay' and other_ans.get('content'):
                        preprocessed_other_answer = preprocess_text(other_ans['content'])
                        if preprocessed_other_answer:
                            documents.append(preprocessed_other_answer)
                            other_submission_map[len(documents) - 1] = {
                                'submission_id': sub.id,
                                'question_id': other_ans.get('questionId'),
                                'student_name': sub.user.first_name + ' ' + sub.user.last_name if sub.user else 'Unknown Student'
                            }
            except json.JSONDecodeError:
                pass

    if len(documents) < 2:
        return {
            'similarityScore': 0,
            'matchedSources': [],
            'cosineSimilarity': 0.0,
            'nlpInsights': {
                'missingKeywords': [],
                'extraKeywords': [],
                'sentiment': 'neutral',
                'readabilityScore': random.randint(50, 90)
            }
        }

    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform(documents)
        cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
        
        for i, sim_score in enumerate(cosine_similarities[0]):
            if sim_score > highest_similarity:
                highest_similarity = sim_score
            
            if sim_score > 0.3:
                matched_sub_info = other_submission_map.get(i + 1)
                if matched_sub_info:
                    matched_sources.append({
                        'source': f"Submission by {matched_sub_info['student_name']} (Question ID: {matched_sub_info['question_id']})",
                        'submissionId': matched_sub_info['submission_id'],
                        'percentage': round(sim_score * 100, 2)
                    })
    except ValueError:
        pass

    nlp_insights = {
        'missingKeywords': [],
        'extraKeywords': [],
        'sentiment': 'neutral',
        'readabilityScore': random.randint(50, 90)
    }

    return {
        'similarityScore': round(highest_similarity * 100, 2),
        'matchedSources': matched_sources,
        'cosineSimilarity': round(highest_similarity, 2),
        'nlpInsights': nlp_insights
    }
    
if __name__ == '__main__':
    # Mock Submission objects for testing
    from datetime import datetime
    class MockUser:
        def __init__(self, first_name, last_name):
            self.first_name = first_name
            self.last_name = last_name

    class MockSubmission:
        def __init__(self, id, user, answers_json):
            self.id = id
            self.user = user
            self.answers_json = json.dumps(answers_json)
            self.submitted_at = datetime.utcnow()  # Required by some parts of the code

    # Example Usage
    student_ans_1 = "<p>Normalization is a database design technique used to organize tables in a manner that reduces data redundancy and improves data integrity. It involves breaking down a large table into smaller, less redundant tables and defining relationships between them. The primary goals are to eliminate redundant data, ensure data dependencies make sense, and protect data integrity.</p>"
    student_ans_2 = "<p>Normalization is a systematic approach to organizing data in a database to reduce data redundancy and improve data integrity. It involves decomposing tables into smaller, well-structured tables and establishing relationships between them. The process aims to eliminate undesirable characteristics like insertion, update, and deletion anomalies.</p>"
    student_ans_3 = "<p>Database normalization is about making tables smaller and linking them. It helps avoid repeating data and keeps data correct. Like, if you have a big list of customers and their orders, you split it into a customer table and an order table. This way, if a customer changes their address, you only update it in one place.</p>"
    student_ans_4 = "<p>The quick brown fox jumps over the lazy dog.</p>"

    mock_submissions = [
        MockSubmission(1, MockUser("John", "Doe"), [{'type': 'essay', 'content': student_ans_1}]),
        MockSubmission(2, MockUser("Jane", "Smith"), [{'type': 'essay', 'content': student_ans_2}]),
        MockSubmission(3, MockUser("Alice", "Brown"), [{'type': 'essay', 'content': student_ans_3}]),
        MockSubmission(4, MockUser("Bob", "White"), [{'type': 'essay', 'content': student_ans_4}]),
    ]

    # Test plagiarism for submission 1
    print("Checking plagiarism for Submission 1:")
    plagiarism_report_1 = check_plagiarism(1, student_ans_1, mock_submissions)
    print(json.dumps(plagiarism_report_1, indent=2))

    # Test plagiarism for submission 3
    print("\nChecking plagiarism for Submission 3:")
    plagiarism_report_3 = check_plagiarism(3, student_ans_3, mock_submissions)
    print(json.dumps(plagiarism_report_3, indent=2))

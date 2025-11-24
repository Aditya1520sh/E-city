import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { useParams } from 'react-router-dom';
import { ThumbsUp, MessageSquare, MapPin, Calendar } from 'lucide-react';
import UserLayout from '../layouts/UserLayout';
import { useToast } from '../context/ToastContext';

const IssueDetails = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const [issue, setIssue] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const ROOT_BASE = API_BASE.replace(/\/api$/, '');
  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const res = await axiosInstance.get(`/issues/${id}`);
      setIssue(res.data);
    } catch (error) {
      console.error('Error fetching issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      await axiosInstance.post(`/issues/${id}/upvote`);
      fetchIssue();
      addToast('Upvoted successfully', 'success');
    } catch (error) {
      addToast('Error upvoting', 'error');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return addToast('Please login to comment', 'error');
    try {
      await axiosInstance.post(`/issues/${id}/comments`, {
        content: comment,
        userId: user.id
      });
      setComment('');
      fetchIssue();
      addToast('Comment posted', 'success');
    } catch (error) {
      addToast('Error posting comment', 'error');
    }
  };

  if (loading) return <UserLayout><div className="text-center py-10 dark:text-white">Loading...</div></UserLayout>;
  if (!issue) return <UserLayout><div className="text-center py-10 dark:text-white">Issue not found</div></UserLayout>;

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-8 transition-colors duration-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{issue.title}</h1>
              <div className="flex flex-wrap items-center text-gray-500 dark:text-gray-400 gap-3 text-sm">
                <span className="flex items-center"><MapPin size={16} className="mr-1"/> {issue.location}</span>
                <span className="flex items-center"><Calendar size={16} className="mr-1"/> {new Date(issue.createdAt).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  issue.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                  issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {issue.status}
                </span>
              </div>
            </div>
            <button 
              onClick={handleUpvote}
              className="self-start flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <ThumbsUp size={20} />
              <span className="font-bold">{issue.upvotes}</span>
            </button>
          </div>

          {issue.imageUrl && (
            <div className="mb-8">
              <img 
                src={`${ROOT_BASE}${issue.imageUrl}`} 
                alt={issue.title} 
                className="w-full h-64 md:h-96 object-cover rounded-xl"
              />
            </div>
          )}

          <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            {issue.description}
          </p>

          <div className="border-t border-gray-100 dark:border-slate-700 pt-8">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <MessageSquare className="mr-2" />
              Comments ({issue.comments.length})
            </h3>

            <div className="space-y-6 mb-8">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{comment.user.name || 'Anonymous'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              ))}
            </div>

            {user ? (
              <form onSubmit={handleComment} className="flex gap-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Post
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg text-center text-gray-600 dark:text-gray-400">
                Please login to leave a comment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </UserLayout>
  );
};

export default IssueDetails;

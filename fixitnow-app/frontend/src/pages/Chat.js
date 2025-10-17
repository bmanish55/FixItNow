import React, { useEffect, useState, useRef } from 'react';
import apiService from '../services/apiService';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    apiService.getCurrentUser()
      .then(res => {
        setUser(res.data);
        return apiService.getConversations(res.data.id);
      })
      .then(res => setConversations(res.data))
      .catch(() => setError('Failed to load conversations.'));
  }, []);

  useEffect(() => {
    if (selectedConv) {
      setLoading(true);
      apiService.getMessages(selectedConv.id)
        .then(res => setMessages(res.data))
        .catch(() => setError('Failed to load messages.'))
        .finally(() => setLoading(false));
    }
  }, [selectedConv]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedConv) return;
    setLoading(true);
    try {
      const msgData = {
        conversationId: selectedConv.id,
        senderId: user.id,
        text: newMsg,
      };
      await apiService.sendMessage(msgData);
      setNewMsg('');
      // Reload messages
      const res = await apiService.getMessages(selectedConv.id);
      setMessages(res.data);
    } catch {
      setError('Failed to send message.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Messages</h1>
      {error && <div className="mb-4 text-center text-red-500">{error}</div>}
      <div className="flex gap-6">
        <div className="w-1/3 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Conversations</h2>
          <ul>
            {conversations.length === 0 && <li className="text-gray-500">No conversations found.</li>}
            {conversations.map(conv => (
              <li key={conv.id} className={`mb-2 p-2 rounded cursor-pointer ${selectedConv?.id === conv.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`} onClick={() => setSelectedConv(conv)}>
                <div className="font-semibold">{conv.participants?.filter(p => p.id !== user?.id).map(p => p.name).join(', ')}</div>
                <div className="text-xs text-gray-500">{conv.lastMessage?.text?.slice(0, 30)}...</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 bg-white shadow rounded-lg p-4 flex flex-col">
          {selectedConv ? (
            <>
              <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: '400px' }}>
                {loading ? <div>Loading messages...</div> : (
                  <ul>
                    {messages.map(msg => (
                      <li key={msg.id} className={`mb-2 flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`inline-block px-4 py-2 rounded-lg ${msg.senderId === user.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                          {msg.text}
                          <div className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
                        </div>
                      </li>
                    ))}
                    <div ref={messagesEndRef} />
                  </ul>
                )}
              </div>
              <form onSubmit={handleSend} className="flex gap-2">
                <input type="text" className="flex-1 border px-3 py-2 rounded" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..." disabled={loading} />
                <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>Send</button>
              </form>
            </>
          ) : (
            <div className="text-gray-500 text-center mt-20">Select a conversation to view messages.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
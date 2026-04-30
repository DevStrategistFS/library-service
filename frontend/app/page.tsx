"use client";

import { useEffect, useState } from 'react';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
}

export default function LibraryHome() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'admin'>('inventory');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '' });

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      if (Array.isArray(data)) setBooks(data);
      else setBooks([]);
    } catch (err) {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation [cite: 49]
    if (newBook.title.trim().length < 2) {
      setStatusMsg("❌ Title must be at least 2 characters");
      return;
    }
    const isbnRegex = /^[0-9-]+$/;
    if (!isbnRegex.test(newBook.isbn) || newBook.isbn.length < 10) {
      setStatusMsg("❌ Enter a valid ISBN (Numbers and dashes only, at least 10 characters)");
      return;
    }

    setStatusMsg("Adding book...");
    try {
      const res = await fetch('/api/books/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });
      const data = await res.json();
      if (data.id) {
        setStatusMsg("✅ Book added successfully");
        setNewBook({ title: '', author: '', isbn: '' });
        fetchBooks();
      } else {
        setStatusMsg("❌ Error adding book");
      }
    } catch (err) {
      setStatusMsg("❌ Connection error");
    }
  };

  const handleBorrow = async (bookId: number) => {
    setStatusMsg("Processing...");
    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`✅ ${data.message}`);
        fetchBooks();
      } else {
        setStatusMsg(`❌ ${data.message}`);
      }
    } catch (err) {
      setStatusMsg("❌ Backend unreachable");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
        statusMsg ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm">
          {statusMsg}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12 border-b border-slate-200 pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Library Service</h1>
          <p className="text-slate-500 mt-2 font-medium">gRPC Management System</p>

          <nav className="flex gap-2 bg-slate-200/50 p-1 rounded-xl mt-8 w-fit">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'inventory' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Books Gallery
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'admin' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Admin Control Panel
            </button>
          </nav>
        </header>

        <div className="min-h-[500px]">
          {activeTab === 'inventory' ? (
            <section className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-800 mb-8">Available Books</h2>
              {loading ? (
                <div className="flex justify-center py-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.length > 0 ? books.map(book => (
                    <div key={book.id} className="bg-white border border-slate-200 p-6 rounded-3xl hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{book.title}</h3>
                        <p className="text-sm text-slate-500 mb-6">by {book.author}</p>
                      </div>
                      <div className="pt-4 border-t border-slate-50 space-y-4">
                        <span className="text-[10px] font-bold text-slate-400">ISBN: {book.isbn}</span>
                        <button
                          onClick={() => handleBorrow(book.id)}
                          className="w-full py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 active:scale-95 transition-all"
                        >
                          Borrow
                        </button>
                      </div>
                    </div>
                  )) : (
                    <p className="col-span-full py-24 text-center text-slate-400">No books found.</p>
                  )}
                </div>
              )}
            </section>
          ) : (
            <section className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-md bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Add New Book</h2>
                <form onSubmit={handleAddBook} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                    <input
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={newBook.title}
                      onChange={e => setNewBook({...newBook, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Author</label>
                    <input
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={newBook.author}
                      onChange={e => setNewBook({...newBook, author: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">ISBN</label>
                    <input
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={newBook.isbn}
                      onChange={e => setNewBook({...newBook, isbn: e.target.value})}
                      required
                    />
                  </div>
                  <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all">
                    Register to Database
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
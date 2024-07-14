import React, { useState, useEffect } from 'react';
import { CheckSquare, PlusCircle, X } from 'lucide-react';

const TodoList = () => {
  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : [];
  });
  
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : {};
  });
  
  const [newCategory, setNewCategory] = useState('');
  const [newTask, setNewTask] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addCategory = () => {
    if (newCategory.trim() !== '') {
      setCategories(prev => [...prev, newCategory.trim()]);
      setTasks(prev => ({ ...prev, [newCategory.trim()]: [] }));
      setNewCategory('');
    }
  };

  const addTask = () => {
    if (activeCategory && newTask.trim() !== '') {
      setTasks(prev => ({
        ...prev,
        [activeCategory]: [...prev[activeCategory], { text: newTask.trim(), completed: false }]
      }));
      setNewTask('');
    }
  };

  const completeTask = (index) => {
    setTasks(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter((_, i) => i !== index)
    }));
  };

  const removeCategory = (categoryToRemove) => {
    setCategories(prev => prev.filter(category => category !== categoryToRemove));
    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[categoryToRemove];
      return newTasks;
    });
    if (activeCategory === categoryToRemove) {
      setActiveCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-indigo-800 mb-8">My Todo List</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Category</h2>
          <div className="flex">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={addCategory}
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 transition duration-300 ease-in-out flex items-center"
            >
              <PlusCircle size={20} className="mr-2" />
              Add
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className={`p-4 cursor-pointer ${activeCategory === category ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setActiveCategory(category)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{category}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeCategory(category); }}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              {activeCategory === category && (
                <div className="p-4">
                  <div className="flex mb-4">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="New task"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                      onClick={addTask}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 transition duration-300 ease-in-out"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {tasks[category] && tasks[category].map((task, index) => (
                      <li key={index} className="flex items-center bg-gray-50 p-2 rounded">
                        <span className="flex-grow">{task.text}</span>
                        <button 
                          onClick={() => completeTask(index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                          title="Mark as complete"
                        >
                          <CheckSquare size={20} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
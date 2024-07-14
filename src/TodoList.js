import React, { useState, useEffect } from 'react';
import { CheckSquare, PlusCircle, X, Edit, ChevronUp, ChevronDown } from 'lucide-react';

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
  const [newTasks, setNewTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(true);

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

  const addTask = (category) => {
    if (newTasks[category] && newTasks[category].trim() !== '') {
      setTasks(prev => ({
        ...prev,
        [category]: [...prev[category], { id: Date.now(), text: newTasks[category].trim(), completed: false }]
      }));
      setNewTasks(prev => ({ ...prev, [category]: '' }));
    }
  };

  const completeTask = (categoryName, taskId) => {
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const removeTask = (categoryName, taskId) => {
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].filter(task => task.id !== taskId)
    }));
  };

  const editTask = (categoryName, taskId, newText) => {
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].map(task => 
        task.id === taskId ? { ...task, text: newText } : task
      )
    }));
    setEditingTask(null);
  };

  const moveTask = (categoryName, taskId, direction) => {
    setTasks(prev => {
      const categoryTasks = [...prev[categoryName]];
      const taskIndex = categoryTasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return prev;
      const newIndex = direction === 'up' ? Math.max(0, taskIndex - 1) : Math.min(categoryTasks.length - 1, taskIndex + 1);
      [categoryTasks[taskIndex], categoryTasks[newIndex]] = [categoryTasks[newIndex], categoryTasks[taskIndex]];
      return { ...prev, [categoryName]: categoryTasks };
    });
  };

  const removeCategory = (categoryToRemove) => {
    setCategories(prev => prev.filter(category => category !== categoryToRemove));
    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[categoryToRemove];
      return newTasks;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-purple-800 mb-8">My Enhanced Todo List</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Category</h2>
          <div className="flex">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              onClick={addCategory}
              className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition duration-300 ease-in-out flex items-center"
            >
              <PlusCircle size={20} className="mr-2" />
              Add
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
          >
            {showAllTasks ? 'Hide All Tasks' : 'Show All Tasks'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-100 text-gray-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{category}</h3>
                  <button 
                    onClick={() => removeCategory(category)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              {showAllTasks && (
                <div className="p-4">
                  <div className="flex mb-4">
                    <input
                      type="text"
                      value={newTasks[category] || ''}
                      onChange={(e) => setNewTasks(prev => ({ ...prev, [category]: e.target.value }))}
                      placeholder="New task"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button 
                      onClick={() => addTask(category)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition duration-300 ease-in-out"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {tasks[category] && tasks[category].map((task, index) => (
                      <li key={task.id} className="flex items-center bg-gray-50 p-2 rounded">
                        {editingTask === task.id ? (
                          <input
                            type="text"
                            value={task.text}
                            onChange={(e) => editTask(category, task.id, e.target.value)}
                            onBlur={() => setEditingTask(null)}
                            autoFocus
                            className="flex-grow px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.text}</span>
                        )}
                        <button 
                          onClick={() => completeTask(category, task.id)}
                          className={`ml-2 ${task.completed ? 'text-green-600' : 'text-gray-400'} hover:text-green-800`}
                          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <CheckSquare size={20} />
                        </button>
                        <button 
                          onClick={() => setEditingTask(task.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          title="Edit task"
                        >
                          <Edit size={20} />
                        </button>
                        <button 
                          onClick={() => moveTask(category, task.id, 'up')}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                          title="Move up"
                          disabled={index === 0}
                        >
                          <ChevronUp size={20} />
                        </button>
                        <button 
                          onClick={() => moveTask(category, task.id, 'down')}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                          title="Move down"
                          disabled={index === tasks[category].length - 1}
                        >
                          <ChevronDown size={20} />
                        </button>
                        <button 
                          onClick={() => removeTask(category, task.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                          title="Remove task"
                        >
                          <X size={20} />
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
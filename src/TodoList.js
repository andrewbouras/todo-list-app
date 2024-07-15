import React, { useState, useEffect, useCallback } from 'react';
import { CheckSquare, PlusCircle, X, Edit, ChevronUp, ChevronDown, RotateCcw, RotateCw } from 'lucide-react';

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
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(true);
  const [history, setHistory] = useState([]);
  const [futureStates, setFutureStates] = useState([]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [categories, tasks]);

  const saveState = useCallback(() => {
    setHistory(prev => [...prev, { categories, tasks }]);
    setFutureStates([]);
  }, [categories, tasks]);

  const undo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setFutureStates(prev => [...prev, { categories, tasks }]);
      setCategories(previousState.categories);
      setTasks(previousState.tasks);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const redo = () => {
    if (futureStates.length > 0) {
      const nextState = futureStates[futureStates.length - 1];
      setHistory(prev => [...prev, { categories, tasks }]);
      setCategories(nextState.categories);
      setTasks(nextState.tasks);
      setFutureStates(prev => prev.slice(0, -1));
    }
  };

  const addCategory = () => {
    if (newCategory.trim() !== '') {
      saveState();
      setCategories(prev => [...prev, newCategory.trim()]);
      setTasks(prev => ({ ...prev, [newCategory.trim()]: [] }));
      setNewCategory('');
    }
  };

  const addTask = (category) => {
    if (newTasks[category] && newTasks[category].trim() !== '') {
      saveState();
      setTasks(prev => ({
        ...prev,
        [category]: [...prev[category], { id: Date.now(), text: newTasks[category].trim(), completed: false }]
      }));
      setNewTasks(prev => ({ ...prev, [category]: '' }));
    }
  };

  const completeTask = (categoryName, taskId) => {
    saveState();
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].filter(task => task.id !== taskId)
    }));
  };

  const removeTask = (categoryName, taskId) => {
    saveState();
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].filter(task => task.id !== taskId)
    }));
  };

  const editTask = (categoryName, taskId, newText) => {
    saveState();
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].map(task => 
        task.id === taskId ? { ...task, text: newText } : task
      )
    }));
    setEditingTask(null);
  };

  const moveTask = (categoryName, taskId, direction) => {
    saveState();
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
    saveState();
    setCategories(prev => prev.filter(category => category !== categoryToRemove));
    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[categoryToRemove];
      return newTasks;
    });
  };

  const editCategory = (oldName, newName) => {
    if (newName.trim() !== '' && newName !== oldName) {
      saveState();
      setCategories(prev => prev.map(cat => cat === oldName ? newName : cat));
      setTasks(prev => {
        const newTasks = { ...prev };
        newTasks[newName] = newTasks[oldName];
        delete newTasks[oldName];
        return newTasks;
      });
    }
    setEditingCategory(null);
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
          <div>
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out mr-2"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={redo}
              disabled={futureStates.length === 0}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out"
            >
              <RotateCw size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-100 text-gray-800">
                <div className="flex justify-between items-center">
                  {editingCategory === category ? (
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => editCategory(category, e.target.value)}
                      onBlur={() => setEditingCategory(null)}
                      autoFocus
                      className="flex-grow px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    <h3 className="text-xl font-semibold">{category}</h3>
                  )}
                  <div>
                    <button 
                      onClick={() => setEditingCategory(category)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => removeCategory(category)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
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
                          <span className="flex-grow">{task.text}</span>
                        )}
                        <button 
                          onClick={() => completeTask(category, task.id)}
                          className="ml-2 text-green-600 hover:text-green-800"
                          title="Mark as complete"
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
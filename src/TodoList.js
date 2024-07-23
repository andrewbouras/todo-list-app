import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckSquare, PlusCircle, X, Edit, ChevronUp, ChevronDown, RotateCcw, RotateCw, ListTodo } from 'lucide-react';

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
  const [showActionItems, setShowActionItems] = useState(false);
  const [actionItems, setActionItems] = useState(() => {
    const savedActionItems = localStorage.getItem('actionItems');
    return savedActionItems ? JSON.parse(savedActionItems) : [];
  });
  const [newActionItem, setNewActionItem] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(() => {
    const savedCount = localStorage.getItem('completedTasksCount');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });
  const handleNewTaskChange = (category, value) => {
    setNewTasks(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const inputRefs = useRef({});


  const addTask = (category) => {
    if (newTasks[category] && newTasks[category].trim() !== '') {
      saveState();
      setTasks(prev => ({
        ...prev,
        [category]: [...prev[category], { id: Date.now(), text: newTasks[category].trim(), completed: false, subtasks: [] }]
      }));
      setNewTasks(prev => ({ ...prev, [category]: '' }));
      // Focus the input after adding a task
      if (inputRefs.current[category]) {
        inputRefs.current[category].focus();
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('actionItems', JSON.stringify(actionItems));
    localStorage.setItem('completedTasksCount', completedTasksCount.toString());
  }, [categories, tasks, actionItems, completedTasksCount]);

  const saveState = useCallback(() => {
    setHistory(prev => [...prev, { categories, tasks, actionItems, completedTasksCount }]);
    setFutureStates([]);
  }, [categories, tasks, actionItems, completedTasksCount]);

  const undo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setFutureStates(prev => [...prev, { categories, tasks, actionItems, completedTasksCount }]);
      setCategories(previousState.categories);
      setTasks(previousState.tasks);
      setActionItems(previousState.actionItems);
      setCompletedTasksCount(previousState.completedTasksCount);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const redo = () => {
    if (futureStates.length > 0) {
      const nextState = futureStates[futureStates.length - 1];
      setHistory(prev => [...prev, { categories, tasks, actionItems, completedTasksCount }]);
      setCategories(nextState.categories);
      setTasks(nextState.tasks);
      setActionItems(nextState.actionItems);
      setCompletedTasksCount(nextState.completedTasksCount);
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

  const completeTask = (categoryName, taskId) => {
    saveState();
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].filter(task => task.id !== taskId)
    }));
    setCompletedTasksCount(prev => prev + 1);
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

  const addSubtask = (categoryName, taskId, subtaskText) => {
    saveState();
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].map(task =>
        task.id === taskId
          ? { ...task, subtasks: [...(task.subtasks || []), { id: Date.now(), text: subtaskText, completed: false }] }
          : task
      )
    }));
  };

  const toggleSubtask = (categoryName, taskId, subtaskId) => {
    saveState();
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
              )
            }
          : task
      )
    }));
  };

  const removeSubtask = (categoryName, taskId, subtaskId) => {
    saveState();
    setTasks(prev => ({
      ...prev,
      [categoryName]: prev[categoryName].map(task =>
        task.id === taskId
          ? { ...task, subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId) }
          : task
      )
    }));
  };

  const addActionItem = () => {
    if (newActionItem.trim() !== '') {
      saveState();
      setActionItems(prev => [...prev, { id: Date.now(), text: newActionItem.trim(), completed: false }]);
      setNewActionItem('');
    }
  };

  const toggleActionItem = (id) => {
    saveState();
    setActionItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeActionItem = (id) => {
    saveState();
    setActionItems(prev => prev.filter(item => item.id !== id));
  };

  const moveActionItem = (id, direction) => {
    saveState();
    setActionItems(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(prev.length - 1, index + 1);
      const newItems = [...prev];
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      return newItems;
    });
  };

  const MainView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <div
          key={category}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-4 bg-gray-50 text-gray-800">
            <div className="flex justify-between items-center">
              {editingCategory === category ? (
                <input
                ref={el => inputRefs.current[category] = el}
                type="text"
                value={newTasks[category] || ''}
                onChange={(e) => handleNewTaskChange(category, e.target.value)}
                placeholder="New task"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              ) : (
                <h3 className="text-lg font-semibold">{category}</h3>
              )}
              <div>
                <button 
                  onClick={() => setEditingCategory(category)}
                  className="text-gray-500 hover:text-gray-700 mr-2"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => removeCategory(category)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
          {showAllTasks && (
            <div className="p-4">
              <div className="flex mb-4">
                <input
                  ref={el => inputRefs.current[category] = el}
                  type="text"
                  value={newTasks[category] || ''}
                  onChange={(e) => handleNewTaskChange(category, e.target.value)}
                  placeholder="New task"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  onClick={() => addTask(category)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300 ease-in-out"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {tasks[category] && tasks[category].map((task, taskIndex) => (
                  <li
                    key={task.id}
                    className="bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center">
                      <span className="flex-grow">{task.text}</span>
                      <button 
                        onClick={() => completeTask(category, task.id)}
                        className="ml-2 text-green-600 hover:text-green-800"
                        title="Mark as complete"
                      >
                        <CheckSquare size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingTask(task.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        title="Edit task"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => moveTask(category, task.id, 'up')}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                        title="Move up"
                        disabled={taskIndex === 0}
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button 
                        onClick={() => moveTask(category, task.id, 'down')}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                        title="Move down"
                        disabled={taskIndex === tasks[category].length - 1}
                      >
                        <ChevronDown size={18} />
                      </button>
                      <button 
                        onClick={() => removeTask(category, task.id)}
                        className="ml-2 text-red-600 hover:text-red-800"
                        title="Remove task"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    {expandedTask === task.id && (
                      <>
                        <ul className="ml-4 mt-2 space-y-1">
                          {task.subtasks && task.subtasks.map((subtask) => (
                            <li key={subtask.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => toggleSubtask(category, task.id, subtask.id)}
                                className="mr-2"
                              />
                              <span className={`flex-grow ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                                {subtask.text}
                              </span>
                              <button
                                onClick={() => removeSubtask(category, task.id, subtask.id)}
                                className="ml-2 text-red-600 hover:text-red-800"
                                title="Remove subtask"
                              >
                                <X size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Add subtask"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                addSubtask(category, task.id, e.target.value.trim());
                                e.target.value = '';
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const ActionItemsView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Action Items</h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={newActionItem}
          onChange={(e) => setNewActionItem(e.target.value)}
          placeholder="New action item"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button 
          onClick={addActionItem}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300 ease-in-out flex items-center"
        >
          <PlusCircle size={20} className="mr-2" />
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {actionItems.map((item, index) => (
          <li key={item.id} className="flex items-center bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleActionItem(item.id)}
              className="mr-2"
            />
            <span className={`flex-grow ${item.completed ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
            <button 
              onClick={() => moveActionItem(item.id, 'up')}
              className="ml-2 text-gray-600 hover:text-gray-800"
              title="Move up"
              disabled={index === 0}
            >
              <ChevronUp size={18} />
            </button>
            <button 
              onClick={() => moveActionItem(item.id, 'down')}
              className="ml-2 text-gray-600 hover:text-gray-800"
              title="Move down"
              disabled={index === actionItems.length - 1}
            >
              <ChevronDown size={18} />
            </button>
            <button 
              onClick={() => removeActionItem(item.id)}
              className="ml-2 text-red-600 hover:text-red-800"
              title="Remove item"
            >
              <X size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Professional Todo List</h1>
          <div className="text-xl font-semibold text-gray-800">
            Tasks Completed: {completedTasksCount}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Category</h2>
          <div className="flex">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button 
              onClick={addCategory}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300 ease-in-out flex items-center"
            >
              <PlusCircle size={20} className="mr-2" />
              Add
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => setShowActionItems(!showActionItems)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out flex items-center mr-2"
            >
              <ListTodo size={20} className="mr-2" />
              {showActionItems ? 'Show Main Todo List' : 'Show Action Items'}
            </button>
            {!showActionItems && (
              <button
                onClick={() => setShowAllTasks(!showAllTasks)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out"
              >
                {showAllTasks ? 'Hide All Tasks' : 'Show All Tasks'}
              </button>
            )}
          </div>
          <div>
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out mr-2 disabled:opacity-50"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={redo}
              disabled={futureStates.length === 0}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out disabled:opacity-50"
            >
              <RotateCw size={20} />
            </button>
          </div>
        </div>

        {showActionItems ? <ActionItemsView /> : <MainView />}
      </div>
    </div>
  );
};

export default TodoList;
                              
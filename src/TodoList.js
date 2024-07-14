import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';

const TodoList = () => {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newTask, setNewTask] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Todo List</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category"
          className="border p-2 mr-2"
        />
        <button onClick={addCategory} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Category
        </button>
      </div>

      <div className="flex mb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`mr-2 px-3 py-1 rounded ${activeCategory === category ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {activeCategory && (
        <div className="mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New task"
            className="border p-2 mr-2"
          />
          <button onClick={addTask} className="bg-green-500 text-white px-4 py-2 rounded">
            Add Task
          </button>
        </div>
      )}

      {activeCategory && tasks[activeCategory] && (
        <div>
          <h2 className="text-xl font-semibold mb-2">{activeCategory}</h2>
          <ul>
            {tasks[activeCategory].map((task, index) => (
              <li key={index} className="mb-2 flex items-center">
                <span className="mr-2">{task.text}</span>
                <button 
                  onClick={() => completeTask(index)} 
                  className="bg-green-500 text-white p-1 rounded"
                  title="Mark as complete"
                >
                  <CheckSquare size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TodoList;
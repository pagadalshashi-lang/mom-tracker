import Sidebar from "@/app/components/Sidebar";
import TaskForm from "@/app/components/TaskForm";

export default function AddTaskPage() {

  return (

    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Add Task
        </h1>

        <TaskForm />

      </div>

    </div>

  );

}
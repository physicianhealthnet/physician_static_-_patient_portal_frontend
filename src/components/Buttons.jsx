export const SaveButton = ({ label, onClick }) => {
    return (
        <button onClick={onClick} className="bg-[#14bef0] hover:bg-[#11a8d2] duration-200 ease-in-out text-white px-4 py-2 rounded h-10 capitalize">{label ? label : "Save"}</button>
    )
}

export const CancelButton = ({ label, onClick }) => {
    return (
        <button onClick={onClick} className="bg-[#787887] hover:bg-[#5a5a64] duration-200 ease-in-out text-white px-4 py-2 rounded h-10 capitalize">{label ? label : "Cancel"}</button>
    )
}

export const EditButton = ({ label, onClick }) => {
    return (
        <button onClick={onClick} className="bg-[#ff7800] hover:bg-[#d46400] duration-200 ease-in-out text-white px-4 py-2 rounded h-10 capitalize">{label ? label : "Edit"}</button>
    )
}

export const LoginButton = ({ label, onclick }) => {
    return (
        <button onClick={onclick} className="text-sm bg-white hover:bg-[#14bef0] border border-[#787887] hover:border-[#14bef0] duration-200 ease-in-out text-[#787887] hover:text-white px-4 rounded h-8 capitalize">{label ? label : "Login / Signup"}</button>
    )
}
import Creatable from 'react-select/creatable';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DatePicker, TimePicker, Radio, Checkbox } from 'antd';
import { Icon } from '@iconify/react';

dayjs.extend(customParseFormat);
export const ReactSelect = ({ value, setValue, options, label, defaultOption, isMulti }) => {
    return (
        <div className='flex flex-col p-2 py-1'>
            <label className='text-lg text-[#2d2d32] font-semibold'>{label}</label>
            <Creatable

                className='w-full h-10'
                styles={{
                    control: (baseStyles) => ({
                        ...baseStyles,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cccccc",
                        borderRadius: "3px",
                        height: "40px",
                        minHeight: "40px",
                    })
                }}
                options={options?.map(opt => ({ label: opt, value: opt })) || []}
                value={
                    isMulti
                        ? (Array.isArray(value) ? value.map(v => ({ label: v, value: v })) : [])
                        : (value ? { label: value, value: value } : null)
                }
                onChange={(selected) => {
                    if (isMulti) {
                        setValue(selected ? selected.map(item => item.value) : []);
                    } else {
                        setValue(selected ? selected.value : "");
                    }
                }}
                placeholder={defaultOption ? defaultOption : "Select"}
                isMulti={isMulti}
            />
        </div>
    );
}

export const TimeInput = ({ value, setValue, label }) => {
    return (
        <div className='flex flex-col p-2 py-1'>
            <label className='text-lg text-[#2d2d32] font-semibold'>{label}</label>
            <TimePicker className='w-full h-10' style={{ border: "1px solid #cccccc", borderRadius: "3px" }} use12Hours format="hh:mm a" value={value ? dayjs(value, "hh:mm a") : null} onChange={(time, timeString) => setValue(timeString)} />
        </div>
    );
}

export const DateInput = ({ value, setValue, label }) => {
    return (
        <div className='flex flex-col p-2 py-1'>
            <label className='text-lg text-[#2d2d32] font-semibold'>{label}</label>
            <DatePicker className='w-full h-10' style={{ border: "1px solid #cccccc", borderRadius: "3px" }} value={value ? dayjs(value, "DD-MM-YYYY") : null} format="DD-MM-YYYY" onChange={(date, dateString) => setValue(dateString)} />
        </div>
    );
}

export const RadioInput = ({ value, setValue, label, options }) => {
    return (
        <div className='flex flex-col p-2 py-1'>
            <label className='text-lg text-[#2d2d32] font-semibold'>{label}</label>
            <Radio.Group
                className='w-full flex flex-wrap gap-3'
                value={value}
                onChange={(e) => setValue(e.target.value)}
            >
                {options?.map((data) => (
                    <Radio
                        key={data}
                        value={data}
                        className={`m-0 px-4 flex flex-row transition-all`}
                    >
                        {data}
                    </Radio>
                ))}
            </Radio.Group>
        </div>
    )
}

export const CheckboxInput = ({ value, setValue, label, options }) => {
    return (
        <div className='flex flex-col p-2 py-1'>
            <label className='text-lg text-[#2d2d32] font-semibold'>{label}</label>
            <Checkbox.Group
                className='w-full flex flex-wrap gap-3'
                value={value}
                onChange={(checkedValues) => setValue(checkedValues)}
            >
                {options?.map((data) => {
                    const isChecked = value?.includes(data);
                    return (
                        <Checkbox
                            key={data}
                            value={data}
                            className={`m-0 px-4 transition-all`}
                        >
                            {data}
                        </Checkbox>
                    );
                })}
            </Checkbox.Group>
        </div>
    )
}

export const SearchInput = ({ value, setValue }) => {
    return (
        <div className='flex flex-col p-2 py-5 w-full max-w-6xl mx-auto'>
            <div className='flex items-center gap-2 w-full h-10 border border-[#78788770] rounded p-2'>
                <Icon icon="material-symbols-light:location-on-outline" className='text-[#787887]' width="24" height="24" />
                <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Find Clinic" className='w-full h-10 outline-none' />
            </div>
        </div>
    )
}
import { useDroppable } from '@dnd-kit/react';

export default function DroppableCell({ id, style, onMouseEnter, onMouseLeave, onClick }) {
    const { ref, isOver } = useDroppable({ id });
    return (
        <td
            ref={ref}
            style={{
                ...style,
                backgroundColor: isOver ? '#bae6fd' : style.backgroundColor,
                outline: isOver ? '2px dashed #0284c7' : 'none',
                transition: 'background-color 0.15s',
                minHeight: '24px',
                height: '100%',
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        />
    );
}
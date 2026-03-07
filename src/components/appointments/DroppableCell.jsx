import { useDroppable } from '@dnd-kit/react';

export default function DroppableCell({ id, isOver, style, onMouseEnter, onMouseLeave, onClick }) {
    const { ref } = useDroppable({ id });  // still needed for drop registration

    return (
        <td
            ref={ref}
            style={{
                ...style,
                backgroundColor: isOver ? '#bae6fd' : style.backgroundColor,
                outline: isOver ? '2px dashed #0284c7' : 'none',
                transition: 'background-color 0.15s',
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        />
    );
}
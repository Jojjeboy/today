import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TagFilterView } from './TagFilterView';
import * as AppContext from '../context/AppContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronLeft: () => <span data-testid="back-icon" />,
  Edit2: () => <span data-testid="edit-icon" />,
  Tag: () => <span data-testid="tag-icon" />,
  X: () => <span data-testid="cancel-icon" />,
}));

vi.mock('./SortableItem', () => ({
  SortableItem: () => <div data-testid="sortable-item" />,
}));

describe('TagFilterView', () => {
  it('updates the global tag name and color', async () => {
    const updateTag = vi.fn().mockResolvedValue(undefined);
    const tag = { id: 'tag-1', name: 'work', color: '#FF5733' };

    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      allTags: [tag],
      getItemsByTag: () => [],
      lists: [],
      deleteItem: vi.fn(),
      updateListItems: vi.fn(),
      updateTag,
    } as unknown as ReturnType<typeof AppContext.useApp>);

    render(
      <MemoryRouter initialEntries={['/tag/tag-1']}>
        <Routes>
          <Route path="/tag/:tagId" element={<TagFilterView />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'tags.edit' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'tags.name' }), {
      target: { value: 'Projects' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'tags.changeColor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose color #33FF57' }));
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));

    expect(updateTag).toHaveBeenCalledWith('tag-1', {
      name: 'projects',
      color: '#33FF57',
    });
  });
});

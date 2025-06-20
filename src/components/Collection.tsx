import { useState, useEffect } from 'react';
import { useSupabaseCMS } from '../hooks/useSupabaseCMS';
import MultilineEditor from './MultilineEditor';
import { EditorButton } from './EditorButton';
import type { ContentFieldRow } from '../types/database';

export interface CollectionProps {
  /** The collection ID to manage */
  collectionId: string;
  /** The collection name (for display purposes) */
  collectionName?: string;
  /** CSS class names for styling */
  classNames?: {
    container?: string;
    header?: string;
    itemsContainer?: string;
    itemContainer?: string;
    addButton?: string;
    removeButton?: string;
    emptyState?: string;
  };
  /** Optional prefix for field names within the collection */
  fieldNamePrefix?: string;
  /** Custom empty state message */
  emptyStateMessage?: string;
  /** Custom wrapper component for the list container with props */
  ListWrapperComponent?: React.ComponentType<
    { children: React.ReactNode } & Record<string, unknown>
  >;
  /** Custom wrapper component for each list item with props */
  ListItemWrapperComponent?: React.ComponentType<
    { children: React.ReactNode } & Record<string, unknown>
  >;
  /** Props to pass to the ListWrapperComponent */
  listWrapperProps?: Record<string, unknown>;
  /** Props to pass to each ListItemWrapperComponent */
  listItemWrapperProps?: Record<string, unknown>;
}

/**
 * A component that manages a collection of content fields.
 * Provides UI for adding, removing, and editing multiple content fields within a collection.
 */
export default function Collection({
  collectionId,
  classNames = {},
  fieldNamePrefix = 'field',
  emptyStateMessage = 'No items in this collection',
  ListWrapperComponent,
  ListItemWrapperComponent,
  listWrapperProps = {},
  listItemWrapperProps = {},
}: CollectionProps) {
  const { services, isInEditMode } = useSupabaseCMS();
  const [items, setItems] = useState<ContentFieldRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load collection items
  useEffect(() => {
    async function loadCollectionItems() {
      setIsLoading(true);
      setError(null);

      try {
        const collectionItems =
          await services.contentFields.getByCollectionId(collectionId);
        setItems(collectionItems);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load collection items';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    if (collectionId) {
      loadCollectionItems();
    }
  }, [collectionId, services.contentFields]);

  // Add new item to collection
  const addItem = async () => {
    try {
      const newItem = await services.contentFields.create({
        field_name: `${fieldNamePrefix}_${Date.now()}`,
        field_value: '',
        collection_id: collectionId,
      });

      if (newItem) {
        setItems((prev) => [...prev, newItem]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
    }
  };

  // Remove item from collection
  const removeItem = async (itemId: string) => {
    try {
      const success = await services.contentFields.delete(itemId);
      if (success) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to remove item';
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div className="bmscms:text-red-600 bmscms:text-sm bmscms:p-4 bmscms:bg-red-100 bmscms:rounded bmscms:border bmscms:border-red-200">
        Error: {error}
      </div>
    );
  }

  const renderItems = () => {
    if (items.length === 0 && emptyStateMessage) {
      return (
        <div
          className={classNames.emptyState || 'bmscms:text-center bmscms:py-8'}
        >
          {emptyStateMessage}
        </div>
      );
    }

    const itemElements = items.map((item) => {
      const itemContent = (
        <>
          {/* Item Content */}
          <MultilineEditor
            fieldName={item.field_name}
            defaultValue={item.field_value || ''}
            className="bmscms:w-full"
          />
          {isInEditMode && (
            <span className="bmscms:inline-block">
              <span
                onClick={() => removeItem(item.id)}
                className={
                  classNames.removeButton ??
                  'bmscms:bg-red-600 bmscms:p-1 bmscms:text-xs bmscms:cursor-pointer'
                }
              >
                Remove
              </span>
            </span>
          )}
        </>
      );

      // Wrap item in custom wrapper component if provided
      if (ListItemWrapperComponent) {
        return (
          <ListItemWrapperComponent key={item.id} {...listItemWrapperProps}>
            {itemContent}
          </ListItemWrapperComponent>
        );
      }

      return (
        <span
          key={item.id}
          className={
            classNames.itemContainer ??
            'bmscms:relative bmscms:flex bmscms:flex-row bmscms:space-between'
          }
        >
          {itemContent}
        </span>
      );
    });

    // Wrap items in custom wrapper component if provided
    if (ListWrapperComponent) {
      return (
        <ListWrapperComponent {...listWrapperProps}>
          {itemElements}
        </ListWrapperComponent>
      );
    }

    return <div className={classNames.itemsContainer}>{itemElements}</div>;
  };

  return (
    <div className={classNames.container}>
      {/* Collection Items */}
      {renderItems()}

      {/* Add Item Button (when items exist) */}
      {isInEditMode && items.length > 0 && (
        <div>
          <EditorButton onClick={addItem} className={classNames.addButton}>
            Add
          </EditorButton>
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useContentFieldsService, useSupabaseCMS } from '../hooks';
import { usePendingChanges } from '../hooks/usePendingChanges';
import { useSiteId, useSupabase } from '../providers/useSiteContext';
import type { ImageUploadProps } from '../types/ImageUploadProps';
import { ACTIVE_EDITOR_CLASS_NAME } from '@/constants';

export default function ImageUpload(props: ImageUploadProps) {
  const {
    fieldName,
    defaultValue = '',
    bucket = 'images',
    folder,
    onChange,
    onUploadStart,
    onUploadSuccess,
    onUploadError,
    accept = 'image/*',
    maxFileSizeMB = 10,
    imgProps,
    inputProps,
    classNames = {},
    activeEditorClassName,
  } = props;

  const { isInEditMode } = useSupabaseCMS();
  const contentFieldsService = useContentFieldsService();
  const siteId = useSiteId();
  const supabase = useSupabase();
  const { addChange, removeChange, onFieldSaved } = usePendingChanges();

  const [fieldId, setFieldId] = useState<string | null>(null);
  const [value, setValue] = useState<string>(defaultValue);
  const [serverValue, setServerValue] = useState<string>(defaultValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const targetFolder = useMemo(() => {
    if (folder && folder.trim().length > 0) {
      return folder.replace(/\/+$/g, '');
    }
    return siteId ? `sites/${siteId}` : 'public';
  }, [folder, siteId]);

  // Load initial content
  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const allFields = await contentFieldsService.getAll();
        const field = allFields.find((f) => f.field_name === fieldName);
        if (mounted) {
          const fieldValue = field?.field_value ?? defaultValue;
          setValue(fieldValue);
          setServerValue(fieldValue);
          setFieldId(field?.id ?? null);
        }
      } catch (e) {
        if (mounted) {
          let message: string;
          if (e instanceof Error) {
            message = e.message;
          } else {
            message = 'Failed to load image field';
          }
          setError(message);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [contentFieldsService, defaultValue, fieldName]);

  // Register field-specific save callback
  useEffect(() => {
    const cleanup = onFieldSaved((savedFieldName, savedFieldId, newValue) => {
      if (savedFieldName === fieldName) {
        if (fieldId === null && savedFieldId !== null) {
          setFieldId(savedFieldId);
        }
        setServerValue(newValue);
        if (!isInEditMode) {
          setValue(newValue);
        }
      }
    });
    return cleanup;
  }, [fieldId, fieldName, isInEditMode, onFieldSaved]);

  // Sync pending changes on value changes
  useEffect(() => {
    if (value !== serverValue) {
      addChange(fieldName, fieldId, value, serverValue);
    } else {
      removeChange(fieldName, fieldId);
    }
  }, [addChange, fieldId, fieldName, removeChange, serverValue, value]);

  // If fieldId appears after a create, re-register the change
  useEffect(() => {
    if (value !== serverValue && fieldId !== null) {
      addChange(fieldName, fieldId, value, serverValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId]);

  const handleFileChosen = useCallback(
    async (file: File) => {
      setError(null);
      if (!file) return;

      const maxBytes = maxFileSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        const message = `File is too large. Max ${maxFileSizeMB}MB.`;
        setError(message);
        onUploadError?.(message);
        return;
      }

      onUploadStart?.(file);
      setIsUploading(true);
      setUploadProgress(0);

      // Create a unique path
      const ext = file.name.split('.').pop() || 'png';
      const timestamp = Date.now();
      const random = Math.random().toString(36).slice(2, 10);
      const objectPath = `${targetFolder}/${fieldName}-${timestamp}-${random}.${ext}`;

      try {
        // Upload file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(objectPath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        // Note: Supabase Storage JS SDK does not expose granular progress; set instantly to 100 after upload.
        setUploadProgress(100);

        if (uploadError) {
          const message = uploadError.message || 'Upload failed';
          setError(message);
          onUploadError?.(message);
          setIsUploading(false);
          return;
        }

        const path = uploadData?.path ?? objectPath;

        // Get public URL (assuming bucket is public or using signed URLs elsewhere)
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);
        const url = publicUrlData.publicUrl;

        setValue(url);
        onChange?.(url);
        onUploadSuccess?.(url, path);
      } catch (e) {
        let message: string;
        if (e instanceof Error) {
          message = e.message;
        } else {
          message = 'Unexpected upload error';
        }
        setError(message);
        onUploadError?.(message);
      } finally {
        setIsUploading(false);
      }
    },
    [
      bucket,
      fieldName,
      maxFileSizeMB,
      onChange,
      onUploadError,
      onUploadStart,
      onUploadSuccess,
      supabase.storage,
      targetFolder,
    ]
  );

  const onInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await handleFileChosen(file);
      }
      // Reset value so selecting the same file again triggers onChange
      event.currentTarget.value = '';
    },
    [handleFileChosen]
  );

  const onRemove = useCallback(() => {
    setValue('');
    onChange?.('');
  }, [onChange]);

  if (isLoading) return null;

  return (
    <span
      className={[
        classNames.container,
        'bmscms:inline-flex bmscms:flex-col bmscms:gap-2 bmscms:relative',
        isInEditMode ? (activeEditorClassName ?? ACTIVE_EDITOR_CLASS_NAME) : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Preview */}
      <span className={[classNames.previewWrapper].filter(Boolean).join(' ')}>
        {value ? (
          <img
            src={value}
            alt=""
            className={[classNames.image].filter(Boolean).join(' ')}
            {...imgProps}
          />
        ) : (
          <span
            className={[
              classNames.placeholder,
              'bmscms:w-full bmscms:h-40 bmscms:bg-gray-100 bmscms:text-gray-400 bmscms:text-sm bmscms:flex bmscms:items-center bmscms:justify-center',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            No image selected
          </span>
        )}
      </span>

      {/* Controls (edit mode) */}
      {isInEditMode && (
        <span
          className={[
            classNames.controls,
            'bmscms:flex bmscms:items-center bmscms:gap-2',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <input
            type="file"
            accept={accept}
            onChange={onInputChange}
            className={classNames.input}
            {...inputProps}
          />
          <button
            type="button"
            onClick={onRemove}
            className={[
              classNames.removeButton,
              'bmscms:px-2 bmscms:py-1 bmscms:text-sm bmscms:bg-gray-200 bmscms:rounded',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            Remove
          </button>
          {isUploading && (
            <span
              className={[
                classNames.progress,
                'bmscms:text-xs bmscms:text-gray-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              Uploading... {uploadProgress}%
            </span>
          )}
        </span>
      )}

      {/* Error */}
      {error && (
        <span
          className={[
            classNames.error,
            'bmscms:text-red-600 bmscms:text-sm bmscms:mt-2 bmscms:p-2 bmscms:bg-red-100 bmscms:rounded bmscms:border bmscms:border-red-200',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {error}
        </span>
      )}
    </span>
  );
}

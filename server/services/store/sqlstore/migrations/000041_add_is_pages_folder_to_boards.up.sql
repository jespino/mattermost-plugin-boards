{{- /* addColumnIfNeeded tableName columnName datatype constraint */ -}}
{{ addColumnIfNeeded "boards" "is_pages_folder" "boolean" "default false"}}
{{ addColumnIfNeeded "boards_history" "is_pages_folder" "boolean" "default false"}}

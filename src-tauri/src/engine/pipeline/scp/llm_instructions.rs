/// Builds the LLM instruction block embedded at the top of every package.
pub fn llm_instructions(project_name: &str, total_packages: usize) -> String {
    let parts_note = if total_packages > 1 {
        format!(
            "This snapshot is part of a multi-package set. There are {} packages in total. \
             Additional parts may exist. Architectural conclusions should only be made after \
             reading every package.",
            total_packages
        )
    } else {
        String::new()
    };
    format!(
        "This is a complete snapshot of the project \"{}\". It is packaged for you to read and \
         understand the project context. The source code has not been modified, reformatted, or \
         summarized. Files remain in their original form. The project tree appears before the \
         source code.{}",
        project_name, parts_note
    )
}

-- auth.usersテーブルへの管理者アクセスを許可
CREATE POLICY "Allow admins to view users"
    ON auth.users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
        )
    ); 
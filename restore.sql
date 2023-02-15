if not exists(select * from sys.databases where name='egccrm_data') begin
    CREATE DATABASE [egccrm_data] ON  PRIMARY 
        ( NAME = N'egccrm_data', FILENAME = N'/var/opt/mssql/source/egccrm_data.mdf' , 
            SIZE = 167872KB , MAXSIZE = UNLIMITED, FILEGROWTH = 16384KB )
        LOG ON 
        ( NAME = N'egccrm_data_log', FILENAME = N'/var/opt/mssql/source/egccrm_data_log.ldf' , 
            SIZE = 2048KB , MAXSIZE = 2048GB , FILEGROWTH = 16384KB )

    restore database egccrm_data 
    from disk='../source/egccrm_data_230211.bak'
    WITH 
        MOVE 'egccrm_data' TO '/var/opt/mssql/source/egccrm_data.mdf',
        MOVE 'egccrm_data_log' TO '/var/opt/mssql/source/egccrm_data_log.ldf', REPLACE
end 

-- if not exists(select * from sys.databases where name='egccrm_v4') begin

--     CREATE DATABASE [egccrm_v4] ON  PRIMARY 
--         ( NAME = N'egccrm_v4', FILENAME = N'/var/opt/mssql/source/egccrm_v4.mdf' , 
--             SIZE = 167872KB , MAXSIZE = UNLIMITED, FILEGROWTH = 16384KB )
--         LOG ON 
--         ( NAME = N'egccrm_v4_log', FILENAME = N'/var/opt/mssql/source/egccrm_v4_log.ldf' , 
--             SIZE = 2048KB , MAXSIZE = 2048GB , FILEGROWTH = 16384KB )


--     restore database egccrm_v4
--     from disk='../source/egccrm_v4_230211.bak'
--     WITH 
--         MOVE 'egccrm_v4' TO '/var/opt/mssql/source/egccrm_v4.mdf',
--         MOVE 'egccrm_v4_log' TO '/var/opt/mssql/source/egccrm_v4_log.ldf', REPLACE
-- END


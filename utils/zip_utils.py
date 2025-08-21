import os
import zipfile


class ZipUtils:
    @staticmethod
    def zip_folder(src_dir, dest_dir, output_filename=None):
        """
        把指定文件夹打包成 zip，并保存到指定目录下
        如果目标目录不存在则自动创建

        :param src_dir: 要打包的文件夹路径
        :param dest_dir: 压缩包保存的目录
        :param output_filename: 压缩包文件名（可选，不传则用文件夹名.zip）
        :return: 生成的压缩包路径
        """
        if not os.path.isdir(src_dir):
            raise ValueError(f"{src_dir} 不是一个有效的文件夹")

        # 如果目标目录不存在，就创建
        os.makedirs(dest_dir, exist_ok=True)

        # 默认文件名：用文件夹名.zip
        if output_filename is None:
            folder_name = os.path.basename(src_dir.rstrip(os.sep))
            output_filename = f"{folder_name}.zip"

        # 压缩包完整路径
        zip_path = os.path.join(dest_dir, output_filename)

        # 创建 zip 文件
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(src_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    # 相对路径写入（保持目录结构）
                    arcname = os.path.relpath(file_path, os.path.dirname(src_dir))
                    zipf.write(file_path, arcname)

        return zip_path
